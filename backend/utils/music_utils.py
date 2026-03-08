import os
import mido
import pretty_midi
import librosa
import librosa.beat
import soundfile as sf
import numpy as np
from basic_pitch.inference import predict, Model
from basic_pitch import ICASSP_2022_MODEL_PATH

# ---------------------------------------------------------------------------
# Load Basic-Pitch model once at import time (avoids repeated disk I/O)
# ---------------------------------------------------------------------------
model = Model(ICASSP_2022_MODEL_PATH)


# ---------------------------------------------------------------------------
# Tempo detection
# ---------------------------------------------------------------------------

def extract_tempo_via_mido(midi_path: str) -> float | None:
    """
    Read the first set_tempo message from a MIDI file.
    Returns BPM as float, or None if no tempo message exists.
    """
    try:
        mid = mido.MidiFile(midi_path)
        for track in mid.tracks:
            for msg in track:
                if msg.type == "set_tempo":
                    return mido.tempo2bpm(msg.tempo)
    except Exception:
        pass
    return None


def estimate_tempo_from_audio(audio_path: str) -> float:
    """
    Estimate BPM from raw audio using librosa beat tracking.
    Falls back to 120.0 on any failure.
    """
    try:
        y, sr = librosa.load(audio_path, sr=22050, mono=True, duration=60)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(np.atleast_1d(tempo)[0])
        
        # Guard against zero or extremely slow tempi
        if bpm <= 0:
            return 120.0

        # Clamp to a musically sensible range
        if bpm < 40:
            bpm *= 2
        elif bpm > 240:
            bpm /= 2
        return round(bpm, 1)
    except Exception:
        return 120.0


def get_tempo(midi_path: str, audio_path: str | None = None) -> float:
    """
    Best-effort tempo: try MIDI first, then audio beat tracking, then 120.
    """
    bpm = extract_tempo_via_mido(midi_path)
    if bpm is not None and bpm != 120.0:
        return round(float(bpm), 1)
    if audio_path and os.path.exists(audio_path):
        return estimate_tempo_from_audio(audio_path)
    return bpm if bpm is not None else 120.0


# ---------------------------------------------------------------------------
# Key-signature estimation
# ---------------------------------------------------------------------------

_KEY_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Krumhansl-Schmuckler key profiles
_KS_MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                       2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_KS_MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                       2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def estimate_key_from_audio(audio_path: str) -> str:
    """
    Estimate the musical key from audio using Krumhansl-Schmuckler profiles
    applied to a chroma representation. Returns a string like 'C major'.
    """
    try:
        y, sr = librosa.load(audio_path, sr=22050, mono=True)
        # Harmonic component gives cleaner chroma
        y_harm, _ = librosa.effects.hpss(y)
        chroma = librosa.feature.chroma_cqt(y=y_harm, sr=sr)
        # Mean chroma across time
        chroma_mean = chroma.mean(axis=1)  # shape (12,)

        best_key, best_qual, best_corr = 0, "major", -np.inf
        for i in range(12):
            shifted = np.roll(chroma_mean, -i)
            major_corr = np.corrcoef(shifted, _KS_MAJOR)[0, 1]
            minor_corr = np.corrcoef(shifted, _KS_MINOR)[0, 1]
            if major_corr > best_corr:
                best_corr = major_corr
                best_key, best_qual = i, "major"
            if minor_corr > best_corr:
                best_corr = minor_corr
                best_key, best_qual = i, "minor"

        return f"{_KEY_NAMES[best_key]} {best_qual}"
    except Exception:
        return "Unknown"


# ---------------------------------------------------------------------------
# MIDI quantization helper
# ---------------------------------------------------------------------------

def quantize_midi(midi_data: pretty_midi.PrettyMIDI, bpm: float, grid: int = 16) -> pretty_midi.PrettyMIDI:
    """
    Snap all note start/end times to the nearest 1/grid note grid.

    Parameters
    ----------
    midi_data : pretty_midi.PrettyMIDI
    bpm       : Tempo used to define the grid size
    grid      : Subdivisions per bar (16 = 1/16th note)
    """
    if bpm <= 0:
        bpm = 120.0
        
    beat_duration = 60.0 / bpm           # seconds per beat
    step = beat_duration / (grid / 4)    # 1/16th note in seconds (for grid=16)

    for instrument in midi_data.instruments:
        for note in instrument.notes:
            note.start = round(note.start / step) * step
            note.end   = round(note.end   / step) * step
            # Avoid zero-length notes
            if note.end <= note.start:
                note.end = note.start + step

    return midi_data


# ---------------------------------------------------------------------------
# Core conversion: Audio → MIDI (Basic-Pitch)
# ---------------------------------------------------------------------------
def ConvertWavToMidi(
    audio_file: str, 
    save_dir: str,
    onset_threshold: float = 0.5,     # FIX: Lowered slightly — 0.6 was missing real notes
    frame_threshold: float = 0.3,     # FIX: Lowered slightly — 0.4 was cutting note tails
    minimum_note_length: int = 58,    # FIX: ~100ms in frames at 22050Hz (not raw ms).
                                      #      Was 100 (frames) = ~580ms — killed staccato notes
    min_freq: float = 65.0,           # ~C2, fine for jazz bass
    max_freq: float = 4200.0          # FIX: Was 2000Hz (~C7). Piano goes to C8 (~4186Hz).
                                      #      This was silently dropping a full octave of treble
) -> tuple[str, int]:
    
    os.makedirs(save_dir, exist_ok=True)
    print(f"[CONVERT] Loading: {audio_file}")

    # 1. Load Audio
    y, sr = librosa.load(audio_file, sr=22050, mono=True)

    # 2. HPSS — increase margin for jazz (piano/bass overlap needs stronger separation)
    # FIX: margin=1.0 → 2.5. At 1.0 it barely separated anything.
    y_harm, _ = librosa.effects.hpss(y, margin=2.5)

    # 3. Normalize
    y_harm = librosa.util.normalize(y_harm)

    # 4. Save temp file
    temp_wav = os.path.join(save_dir, "_temp_" + os.path.basename(audio_file))
    sf.write(temp_wav, y_harm, sr)

    try:
        _, midi_data, note_events = predict(
            audio_path=temp_wav,
            model_or_model_path=model,
            onset_threshold=onset_threshold,
            frame_threshold=frame_threshold,
            minimum_note_length=minimum_note_length,
            minimum_frequency=min_freq,
            maximum_frequency=max_freq,
            melodia_trick=True,
            multiple_pitch_bends=False
        )

        # 5. Post-Processing: Ghost note cleanup + velocity normalization
        total_cleaned = 0

        for instrument in midi_data.instruments:
            # FIX: cleaned_notes MUST be inside the instrument loop.
            # Before, it was declared outside — notes from instrument N-1
            # would carry over and corrupt instrument N's note list.
            cleaned_notes = []

            for note in instrument.notes:
                duration_ms = (note.end - note.start) * 1000
                # Keep note only if it's long enough and loud enough
                if duration_ms >= 100 and note.velocity > 15:
                    cleaned_notes.append(note)

            # FIX: Velocity normalization — this is why notes sound "too loud".
            # Basic Pitch outputs raw velocities skewed toward 90–127.
            # Remap to a musical range (40–100) using min-max scaling.
            if cleaned_notes:
                velocities = np.array([n.velocity for n in cleaned_notes])
                v_min, v_max = velocities.min(), velocities.max()
                TARGET_LOW, TARGET_HIGH = 40, 100

                for note in cleaned_notes:
                    if v_max > v_min:
                        # Scale proportionally into target range
                        normalized = (note.velocity - v_min) / (v_max - v_min)
                        note.velocity = int(TARGET_LOW + normalized * (TARGET_HIGH - TARGET_LOW))
                    else:
                        # All notes same velocity — set to midpoint
                        note.velocity = (TARGET_LOW + TARGET_HIGH) // 2

            instrument.notes = cleaned_notes
            total_cleaned += len(cleaned_notes)

        # 6. Quantize — FIX: Use grid=32 for jazz to preserve microtiming/swing feel.
        # grid=16 was quantizing swing 8ths onto a straight grid, erasing the jazz feel.
        bpm_est = estimate_tempo_from_audio(audio_file)
        midi_data = quantize_midi(midi_data, bpm_est, grid=32)

        stem = os.path.splitext(os.path.basename(audio_file))[0]
        output_midi_path = os.path.join(save_dir, stem + ".mid")
        midi_data.write(output_midi_path)

        return output_midi_path, total_cleaned

    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)


# def ConvertWavToMidiDamRsn(wav_file: str, save_dir: str,
#                             note_sensitivity: float = 0.4,
#                             split_sensitivity: float = 0.2,
#                             min_note_duration_ms: int = 60) -> tuple[str, int]:
#     """
#     Legacy wrapper delegating to high-sensitivity ConvertWavToMidi.
#     """
#     return ConvertWavToMidi(
#         wav_file, 
#         save_dir, 
#         onset_threshold=note_sensitivity, 
#         frame_threshold=split_sensitivity, 
#         minimum_note_length=min_note_duration_ms
#     )


# ---------------------------------------------------------------------------
# MIDI analysis: MIDI → note list
# ---------------------------------------------------------------------------

def analyze_with_pretty_midi(
    midi_path: str,
    audio_path: str | None = None,
    start_sec: float = 0,
    duration_sec: float = 600,
) -> tuple[list[dict], float, float]:
    """
    Parse a MIDI file and return (notes, tempo_bpm, total_time).

    Improvements:
    - Normalizes velocities so the track has a consistent dynamic range (loudest note = 1.0).
    - Improved deduplication: removes notes of same pitch that start within 20ms of each other.
    - Handles multiple tracks by merging them.
    """
    try:
        midi_data = pretty_midi.PrettyMIDI(midi_path)
    except Exception as e:
        print(f"[ERROR] Could not parse MIDI {midi_path}: {e}")
        return [], 120.0, 0.0

    end_sec = start_sec + duration_sec
    all_notes: list[dict] = []

    # Collect all notes from all non-drum instruments
    for instrument in midi_data.instruments:
        if instrument.is_drum:
            continue

        for n in instrument.notes:
            if start_sec <= n.start <= end_sec:
                all_notes.append({
                    "name":     pretty_midi.note_number_to_name(n.pitch),
                    "midi":     int(n.pitch),
                    "time":     round(float(n.start), 4),
                    "duration": round(float(n.end - n.start), 4),
                    "velocity": float(n.velocity),
                })

    if not all_notes:
        tempo_bpm = get_tempo(midi_path, audio_path)
        return [], tempo_bpm, 0.0

    # 1. Velocity Normalization
    # Basic Pitch often produces very low velocities. We rescale to 0.1-1.0 range.
    max_vel = max(n["velocity"] for n in all_notes) if all_notes else 100
    if max_vel > 0:
        for n in all_notes:
            # Scale so max_vel becomes 1.0, but keep some floor
            n["velocity"] = round(max(0.1, n["velocity"] / max_vel), 4)
    else:
        for n in all_notes:
            n["velocity"] = 0.8

    # 2. Re-enabled Deduplication for Accuracy
    # Window reduced to 20ms to allow faster successive notes
    all_notes.sort(key=lambda x: (x["time"], x["midi"]))
    
    deduped: list[dict] = []
    last_note_for_pitch = {} 

    for note in all_notes:
        pitch = note["midi"]
        start_time = note["time"]
        
        # 20ms window for high accuracy
        if pitch in last_note_for_pitch:
            if abs(start_time - last_note_for_pitch[pitch]) < 0.020:
                continue
        
        deduped.append(note)
        last_note_for_pitch[pitch] = start_time

    # Final sort by time
    deduped.sort(key=lambda x: x["time"])

    # 3. Tempo — MIDI first, then audio beat tracking
    tempo_bpm = get_tempo(midi_path, audio_path)

    total_time = (
        round(max(n["time"] + n["duration"] for n in deduped), 2)
        if deduped else 0.0
    )

    return deduped, tempo_bpm, total_time


# ---------------------------------------------------------------------------
# Serialisation helper
# ---------------------------------------------------------------------------

def serialize_note(n: dict) -> dict:
    """Ensure all note fields are JSON-serialisable primitives."""
    return {
        "name":     str(n["name"]),
        "midi":     int(n["midi"]),
        "time":     float(n["time"]),
        "duration": float(n["duration"]),
        "velocity": float(n["velocity"]),
    }


# ---------------------------------------------------------------------------
# Unified pipeline: Audio → MIDI → JSON dict
# ---------------------------------------------------------------------------

def wav_to_json_data(audio_path: str, save_dir: str, **kwargs) -> dict:
    """
    Full pipeline: WAV or MP3 → MIDI (Basic-Pitch) → analysis dict.

    Returns a dict ready to be JSON-serialised and sent to the frontend.
    """
    print(f"[PIPELINE] Starting for: {audio_path}")

    # Step 1 — Audio → MIDI
    midi_path, note_count = ConvertWavToMidi(audio_path, save_dir, **kwargs)
    print(f"[PIPELINE] MIDI conversion done. Raw note events: {note_count}")

    # Step 2 — MIDI → note list + tempo
    notes, tempo_bpm, total_time = analyze_with_pretty_midi(
        midi_path, audio_path=audio_path
    )
    print(f"[PIPELINE] Analysis done. Notes after dedup: {len(notes)}, BPM: {tempo_bpm}")

    # Step 3 — Key signature from audio
    key_sig = estimate_key_from_audio(audio_path)
    print(f"[PIPELINE] Estimated key: {key_sig}")

    # Step 4 — Derived metadata
    note_density = round(len(notes) / total_time, 2) if total_time > 0 else 0.0

    if not notes:
        print("[WARNING] No notes detected. Check audio volume and content.")

    return {
        "status":        "ok",
        "tempo_bpm":     tempo_bpm,
        "total_time":    total_time,
        "key_signature": key_sig,
        "note_count":    len(notes),
        "note_density":  note_density,
        "midi_filename": os.path.basename(midi_path),
        "notes":         [serialize_note(n) for n in notes],
    }