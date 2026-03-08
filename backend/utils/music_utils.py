import os
import mido
import pretty_midi
import librosa
import librosa.beat
import soundfile as sf
import numpy as np
import scipy.signal
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
    Estimate BPM from raw audio using librosa beat tracking + PLP cross-check.
    Falls back to 120.0 on any failure.
    """
    try:
        y, sr = librosa.load(audio_path, sr=22050, mono=True, duration=60)
        
        # Primary: onset-strength-based tempo (more robust than beat_track for jazz)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo_dynamic = librosa.feature.tempo(onset_envelope=onset_env, sr=sr)
        bpm = float(np.atleast_1d(tempo_dynamic)[0])

        # Fallback: standard beat tracker as cross-check
        tempo_beat, _ = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset_env)
        bpm_beat = float(np.atleast_1d(tempo_beat)[0])

        # If the two estimates are close (within 10%), average them
        if abs(bpm - bpm_beat) / max(bpm, 1) < 0.10:
            bpm = (bpm + bpm_beat) / 2

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
    """
    if bpm <= 0:
        bpm = 120.0
        
    beat_duration = 60.0 / bpm           # seconds per beat
    step = beat_duration / (grid / 4)    # grid subdivision in seconds

    # FIX: use a small fixed minimum instead of grid step
    MIN_NOTE_SEC = 0.05  # 50ms minimum regardless of grid

    for instrument in midi_data.instruments:
        for note in instrument.notes:
            note.start = round(note.start / step) * step
            note.end   = round(note.end   / step) * step
            # Avoid zero-length notes
            if note.end <= note.start:
                note.end = note.start + MIN_NOTE_SEC

    return midi_data


# ---------------------------------------------------------------------------
# Audio Preprocessing Helpers
# ---------------------------------------------------------------------------

def apply_bandpass_filter(y, sr, low_cut=50.0, high_cut=8000.0):
    """
    Remove low-frequency rumble (<50Hz) and high-frequency hiss (>8kHz).
    Uses a zero-phase Butterworth filter.
    """
    try:
        # Nyquist frequency
        nyq = 0.5 * sr
        low = low_cut / nyq
        high = high_cut / nyq
        
        # 5th order filter
        sos = scipy.signal.butter(5, [low, high], btype='bandpass', output='sos')
        return scipy.signal.sosfiltfilt(sos, y)
    except Exception as e:
        print(f"[WARNING] Bandpass filter failed: {e}. Returning original.")
        return y


# ---------------------------------------------------------------------------
# Core conversion: Audio → MIDI (Basic-Pitch)
# ---------------------------------------------------------------------------
def ConvertWavToMidi(
    audio_file: str, 
    save_dir: str,
    onset_threshold: float = 0.5,
    frame_threshold: float = 0.3,
    minimum_note_length: int = 58,
    min_freq: float = 65.0,
    max_freq: float = 4200.0
) -> tuple[str, int]:
    
    os.makedirs(save_dir, exist_ok=True)
    print(f"[CONVERT] Loading: {audio_file}")

    # 1. Load Audio
    y, sr = librosa.load(audio_file, sr=22050, mono=True)

    # 1a. Pre-filter: Clean rumble and hiss
    y = apply_bandpass_filter(y, sr)

    # 2. HPSS — blend harmonic + partial percussive back in to preserve hammer attacks
    y_harm, y_perc = librosa.effects.hpss(y, margin=2.5)
    y_blended = y_harm + (y_perc * 0.25)   # 25% percussive preserves hammer attacks

    # 3. Normalize
    y_blended = librosa.util.normalize(y_blended)

    # 4. Save temp file
    temp_wav = os.path.join(save_dir, "_temp_" + os.path.basename(audio_file))
    sf.write(temp_wav, y_blended, sr)

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

        # 5. Post-Processing: Ghost note cleanup + Velocity Log-Compression
        total_cleaned = 0
        TARGET_LOW, TARGET_HIGH = 40, 110

        for instrument in midi_data.instruments:
            cleaned_notes = []
            for note in instrument.notes:
                duration_ms = (note.end - note.start) * 1000
                if duration_ms >= 100 and note.velocity > 15:
                    # Log compression: preserves dynamic contrast without hard-clipping quiet notes
                    log_vel = np.log1p(note.velocity) / np.log1p(127)
                    note.velocity = int(TARGET_LOW + log_vel * (TARGET_HIGH - TARGET_LOW))
                    cleaned_notes.append(note)

            instrument.notes = cleaned_notes
            total_cleaned += len(cleaned_notes)

        # 6. Quantize
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

    # 1. Velocity Division (0.0-1.0)
    # FIX: avoid second normalization pass. Just divide by 127.
    for n in all_notes:
        n["velocity"] = round(n["velocity"] / 127.0, 4)

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
# Higher-level metadata helpers
# ---------------------------------------------------------------------------

def infer_sustain_pedal(notes: list[dict], overlap_threshold: float = 0.05) -> list[dict]:
    """
    If two notes of the same pitch overlap by > 50ms, mark both as pedaled.
    This hints to the frontend synthesizer to use a longer release envelope.
    """
    for i, note in enumerate(notes):
        for j in range(i + 1, len(notes)):
            other = notes[j]
            if other["time"] > note["time"] + note["duration"]:
                break  # Past possible overlap
            if other["midi"] == note["midi"]:
                overlap = (note["time"] + note["duration"]) - other["time"]
                if overlap > overlap_threshold:
                    note["pedal"] = True
                    other["pedal"] = True
    # Default pedal = False for unmarked notes
    for note in notes:
        note.setdefault("pedal", False)
    return notes

def group_chords(notes: list[dict], window_sec: float = 0.030) -> list[dict]:
    """Tag notes that form chords with a shared chord_id."""
    chord_id = 0
    for i, note in enumerate(notes):
        if "chord_id" in note:
            continue
        chord_members = [note]
        for j in range(i + 1, len(notes)):
            if notes[j]["time"] - note["time"] > window_sec:
                break
            if "chord_id" not in notes[j]:
                chord_members.append(notes[j])
        if len(chord_members) > 1:
            for m in chord_members:
                m["chord_id"] = chord_id
            chord_id += 1
        else:
            note["chord_id"] = None
    return notes

def serialize_note(n: dict, beat_step_sec: float = 0.125) -> dict:
    """Ensure all note fields are JSON-serialisable primitives with articulation."""
    duration = float(n["duration"])
    # Articulation inference
    if duration < beat_step_sec * 0.6:
        articulation = "staccato"
    elif duration > beat_step_sec * 1.8:
        articulation = "legato"
    else:
        articulation = "normal"

    return {
        "name":         str(n["name"]),
        "midi":         int(n["midi"]),
        "time":         float(n["time"]),
        "duration":     duration,
        "velocity":     float(n["velocity"]),
        "articulation": articulation,
        "pedal":        n.get("pedal", False),
        "chord_id":     n.get("chord_id"),
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

    # Step 4 — Metadata Enrichment (Pedal, Chords)
    notes = infer_sustain_pedal(notes)
    notes = group_chords(notes)

    # Step 5 — Derived metadata
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
        "notes":         [serialize_note(n, 60.0 / (tempo_bpm * 4) if tempo_bpm > 0 else 0.125) for n in notes],
    }