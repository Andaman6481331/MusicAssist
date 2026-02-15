import pretty_midi
import json
import os
from typing import List, Dict, Tuple


def extract_all_notes(file_path: str) -> List[Dict]:
    midi_data = pretty_midi.PrettyMIDI(file_path)
    notes = []
    for instrument in midi_data.instruments:
        if instrument.is_drum:
            continue
        for note in instrument.notes:
            notes.append({
                'midi': note.pitch,
                'name': pretty_midi.note_number_to_name(note.pitch),
                'start': round(note.start, 5),
                'end': round(note.end, 5),
                'duration': round(note.end - note.start, 5),
                'velocity': round(note.velocity / 127, 5)
            })
    return notes, midi_data.get_end_time(), midi_data.get_tempo_changes()[1][0] if midi_data.get_tempo_changes()[1].size > 0 else 120.0


def compute_dynamic_threshold(notes: List[Dict], time_window=4.0) -> List[Tuple[float, float]]:
    thresholds = []
    max_time = max(n['start'] for n in notes)
    t = 0.0

    while t <= max_time:
        group = [n for n in notes if t <= n['start'] < t + time_window]
        if not group:
            t += time_window
            continue
        pitches = sorted(n['midi'] for n in group)
        mid = len(pitches) // 2
        threshold = (pitches[mid] if len(pitches) % 2 else (pitches[mid - 1] + pitches[mid]) / 2)
        thresholds.append((t, threshold))
        t += time_window
    return thresholds


def assign_hands_by_dynamic_threshold(notes: List[Dict], thresholds: List[Tuple[float, float]]) -> List[Dict]:
    result = []
    for note in notes:
        for start_time, threshold in thresholds:
            if start_time <= note['start'] < start_time + 4.0:
                hand = 'LH' if note['midi'] < threshold else 'RH'
                note_labeled = note.copy()
                note_labeled['time'] = note_labeled.pop('start')
                note_labeled.pop('end')
                note_labeled['hand'] = hand
                result.append(note_labeled)
                break
    return result


def export_to_json(file_path: str, output_dir: str):
    notes_raw, total_time, tempo_bpm = extract_all_notes(file_path)
    thresholds = compute_dynamic_threshold(notes_raw)
    labeled_notes = assign_hands_by_dynamic_threshold(notes_raw, thresholds)

    output = {
        "tempo_bpm": round(tempo_bpm, 2),
        "total_time": round(total_time, 2),
        "notes": labeled_notes
    }

    os.makedirs(output_dir, exist_ok=True)
    filename = os.path.splitext(os.path.basename(file_path))[0] + ".json"
    output_path = os.path.join(output_dir, filename)

    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print("✅ JSON saved at:", output_path)


# Usage:
export_to_json("./test.mid", "../frontend/public/JsonOutputs")
