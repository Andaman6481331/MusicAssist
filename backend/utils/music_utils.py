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
        # librosa may return an array in newer versions
        bpm = float(np.atleast_1d(tempo)[0])
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
    beat_duration = 60.0 / bpm           # seconds per beat
    step = beat_duration / (grid / 4)    # 1/16th note in seconds

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

def ConvertWavToMidi(audio_file: str, save_dir: str) -> tuple[str, int]:
    """
    Convert a WAV or MP3 file to MIDI using Basic-Pitch.

    Improvements over original:
    - Harmonic-percussive source separation (HPSS) strips drums/noise so
      Basic-Pitch only sees the melodic/harmonic content.
    - Lower, more permissive thresholds to capture softer notes.
    - Wider frequency range (C1–C7).
    - Post-conversion MIDI quantization to 1/16th note grid.

    Returns
    -------
    (midi_path, note_count)
    """
    os.makedirs(save_dir, exist_ok=True)

    print(f"[CONVERT] Loading audio: {audio_file}")
    # Load at 22050 Hz mono (librosa decodes MP3 transparently)
    y, sr = librosa.load(audio_file, sr=22050, mono=True)

    # 1. Harmonic-percussive source separation — keep only pitched content
    print("[CONVERT] Running HPSS (harmonic-percussive source separation)...")
    y_harm, _ = librosa.effects.hpss(y, margin=3.0)

    # 2. Normalise
    peak = np.max(np.abs(y_harm))
    if peak > 0:
        y_harm = y_harm / peak

    # 3. Pre-emphasis to boost note attack transients
    y_harm = librosa.effects.preemphasis(y_harm, coef=0.97)

    # 4. Trim leading/trailing silence
    y_harm, _ = librosa.effects.trim(y_harm, top_db=30)

    # 5. Write preprocessed audio to temp file for Basic-Pitch
    processed_path = os.path.join(save_dir, "_bp_input_" + os.path.basename(audio_file))
    # Always write as WAV regardless of input format
    processed_path_wav = os.path.splitext(processed_path)[0] + ".wav"
    sf.write(processed_path_wav, y_harm, sr)

    try:
        print("[CONVERT] Running Basic-Pitch inference...")
        _, midi_data, note_events = predict(
            audio_path=processed_path_wav,
            model_or_model_path=model,
            onset_threshold=0.5,          # was 0.7 — lower = more notes captured
            frame_threshold=0.3,          # was 0.5
            minimum_note_length=80,       # ms; was 120 — capture shorter notes
            minimum_frequency=32.7,       # C1 (was 55 Hz / A1)
            maximum_frequency=2093.0,     # C7
            melodia_trick=True,           # smoothing pass to remove spurious short notes
            multiple_pitch_bends=False,
        )

        # 6. Quantize notes to 1/16th grid using estimated tempo
        bpm_est = estimate_tempo_from_audio(audio_file)
        print(f"[CONVERT] Quantizing to 1/16 grid @ {bpm_est:.1f} BPM...")
        midi_data = quantize_midi(midi_data, bpm_est)

        # 7. Save MIDI
        stem = os.path.splitext(os.path.basename(audio_file))[0]
        output_midi_path = os.path.join(save_dir, stem + ".mid")
        midi_data.write(output_midi_path)
        print(f"[CONVERT] MIDI saved: {output_midi_path} ({len(note_events)} notes)")

        return output_midi_path, len(note_events)

    finally:
        if os.path.exists(processed_path_wav):
            os.remove(processed_path_wav)


# Legacy alias kept for backward-compatibility with server.py import
def ConvertWavToMidiDamRsn(wav_file: str, save_dir: str,
                            note_sensitivity: float = 0.5,
                            split_sensitivity: float = 0.3,
                            min_note_duration_ms: float = 80) -> tuple[str, int]:
    """
    Thin wrapper kept for backward-compatibility.
    Delegates to the improved ConvertWavToMidi.
    """
    return ConvertWavToMidi(wav_file, save_dir)


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
    - Accepts optional audio_path for librosa tempo fallback.
    - Deduplication uses a tighter tolerance window.
    - Returns velocity already normalised to 0–1.
    """
    midi_data = pretty_midi.PrettyMIDI(midi_path)
    end_sec = start_sec + duration_sec
    all_notes: list[dict] = []

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
                    "velocity": round(n.velocity / 127.0, 4),
                })

    # Deduplication: same pitch within 5 ms as the same note
    deduped: list[dict] = []
    seen: set[tuple] = set()
    for note in all_notes:
        key = (note["midi"], round(note["time"] / 0.005))  # 5 ms buckets
        if key not in seen:
            deduped.append(note)
            seen.add(key)

    deduped.sort(key=lambda x: x["time"])

    # Tempo — MIDI first, then audio beat tracking
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

def wav_to_json_data(audio_path: str, save_dir: str) -> dict:
    """
    Full pipeline: WAV or MP3 → MIDI (Basic-Pitch) → analysis dict.

    Returns a dict ready to be JSON-serialised and sent to the frontend.
    """
    print(f"[PIPELINE] Starting for: {audio_path}")

    # Step 1 — Audio → MIDI
    midi_path, note_count = ConvertWavToMidi(audio_path, save_dir)
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