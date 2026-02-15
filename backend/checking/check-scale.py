import json
import numpy as np
from scipy.signal import find_peaks

# Define scale templates (pitch class intervals)
MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]

# Map pitch class numbers to note names
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def midi_to_pitch_class(midi_num: int) -> int:
    """Convert MIDI number (0–127) to pitch class (0–11)."""
    return midi_num % 12

def get_scale_pitches(root_index: int, scale_pattern: list[int]) -> set[int]:
    """Get pitch classes for a given root and scale pattern."""
    return {(root_index + interval) % 12 for interval in scale_pattern}

def detect_song_key(json_path: str):
    """Detect the most likely key (major or minor) from a MIDI note JSON."""
    with open(json_path, 'r') as f:
        song_data = json.load(f)

    notes = song_data.get("notes", [])
    if not notes:
        return "No notes found"

    # Extract pitch classes from notes
    pitch_classes = [midi_to_pitch_class(note["midi"]) for note in notes]
    unique_pitches = set(pitch_classes)

    best_key = None
    best_score = -1

    for i in range(12):
        major_scale = get_scale_pitches(i, MAJOR_SCALE)
        minor_scale = get_scale_pitches(i, MINOR_SCALE)

        major_score = len(unique_pitches & major_scale)
        minor_score = len(unique_pitches & minor_scale)

        if major_score > best_score:
            best_score = major_score
            best_key = f"{NOTE_NAMES[i]} major"

        if minor_score > best_score:
            best_score = minor_score
            best_key = f"{NOTE_NAMES[i]} minor"

    # Compute confidence as ratio of matches / number of unique notes
    confidence = (best_score / len(unique_pitches)) * 100
    return f"{best_key} ({confidence:.1f}% confidence)"


def detect_time_signature(json_path):
    # --- Load JSON file ---
    with open(json_path, 'r') as f:
        data = json.load(f)

    notes = data.get("notes", [])
    if not notes:
        return {"time_signature": "Unknown", "confidence": 0.0}

    # --- Extract and sort note onset times ---
    onset_times = np.sort([note["time"] for note in notes])

    # --- Calculate inter-onset intervals (IOIs) ---
    iois = np.diff(onset_times)
    if len(iois) < 4:
        return {"time_signature": "Unknown", "confidence": 0.0}

    # --- Normalize timing to remove tempo influence ---
    avg_ioi = np.median(iois)
    normalized = iois / avg_ioi

    # --- Autocorrelation to find rhythmic periodicity ---
    corr = np.correlate(normalized - np.mean(normalized), normalized - np.mean(normalized), mode="full")
    corr = corr[len(corr)//2:]  # Only positive lags

    # --- Detect rhythmic repetition peaks ---
    peaks, properties = find_peaks(corr, height=np.max(corr)*0.2, distance=2)
    if len(peaks) == 0:
        return {"time_signature": "Unknown", "confidence": 0.0}

    # --- Estimate periodic group size (approx beats per bar) ---
    first_peak = peaks[0]
    beats_per_bar = round(first_peak)

    # --- Candidate time signatures and typical usage ---
    time_signature_candidates = {
        2: ("2/4", "March, Polka"),
        3: ("3/4", "Waltz, Ballad"),
        4: ("4/4", "Pop, Rock, Blues, Jazz"),
        5: ("5/4", "Progressive Jazz, Fusion"),
        6: ("6/8", "Blues Shuffle, Rock Ballad"),
        7: ("7/8", "Fusion, Experimental"),
        9: ("9/8", "Jazz Waltz, Folk"),
        12: ("12/8", "Swing, R&B, Blues, Gospel")
    }

    # --- Find closest match ---
    closest = min(time_signature_candidates.keys(), key=lambda x: abs(x - beats_per_bar))
    time_signature, common_genres = time_signature_candidates[closest]

    # --- Compute confidence from peak strength ---
    main_peak_strength = properties["peak_heights"][0]
    confidence = round(float(main_peak_strength / np.max(corr)), 2)

    return {
        "time_signature": time_signature,
        "beats_per_bar": beats_per_bar,
        "confidence": confidence,
        "common_genres": common_genres
    }

# Example usage:
if __name__ == "__main__":
    # key = detect_song_key(path + "Before Spring Ends_basic_pitch.json")
    # key = detect_song_key(path + "No One Else.json")
    # key = detect_song_key(path + "perfect.json")
    # key = detect_song_key(path + "thisGame.json")
    # key = detect_song_key(path + "WalkYouHome(1).json")

    # fullpath = path + "No One Else.json"
    filename = "perfect.json"
    # filename = "prompt1.json"
    path = "../frontend/public/JsonOutputs/"
    fullpath = path + filename

    key = detect_song_key(fullpath)
    timesignature = detect_time_signature(fullpath)

    print(f"Filename: {filename}")
    print(f"Detected key: {key}")
    print(f"Time signature is: {timesignature}")