import pretty_midi
import json
import os
import mido
from collections import defaultdict

def group_simultaneous_notes(notes, epsilon=0.02):
    groups = defaultdict(list)
    for note in notes:
        key = round(note['time'] / epsilon)
        groups[key].append(note)
    return list(groups.values())

def is_hand_playable(notes):
    if len(notes) == 0:
        return False
    if len(notes) > 5:
        return False
    pitches = sorted(n['midi'] for n in notes)
    return (pitches[-1] - pitches[0]) <= 15  # max stretch ~15 semitones


def split_hands_if_playable(group):
    if len(group) > 10 or len(group) < 2:
        return None, None

    group_sorted = sorted(group, key=lambda n: n['midi'])
    mid = len(group_sorted) // 2

    left_hand = group_sorted[:mid]
    right_hand = group_sorted[mid:]

    if is_hand_playable(left_hand) and is_hand_playable(right_hand):
        return left_hand, right_hand
    return None, None



def is_group_playable(group):
    if len(group) > 10:
        return False  # too many notes
    # Try naive split: left = lower 5, right = upper 5
    group_sorted = sorted(group, key=lambda n: n['midi'])
    left_hand = group_sorted[:min(5, len(group)//2)]
    right_hand = group_sorted[-min(5, len(group)//2):]
    return is_hand_playable(left_hand) and is_hand_playable(right_hand)


def is_playable(note):
    # Define filtering conditions
    if note['duration'] < 0.05:  # Too short
        return False
    if note['velocity'] < 0.2:   # Too quiet
        return False
    if note['midi'] < 21 or note['midi'] > 108:  # Outside piano range
        return False
    return True


def extract_tempo_via_mido(path):
    mid = mido.MidiFile(path)
    for track in mid.tracks:
        for msg in track:
            if msg.type == 'set_tempo':
                return mido.tempo2bpm(msg.tempo)
    return 120.0

def analyze_with_pretty_midi(file_path, start_sec=0, duration_sec=120):
    midi_data = pretty_midi.PrettyMIDI(file_path)
    all_notes = []

    for instrument in midi_data.instruments:
        if instrument.is_drum:
            continue  # skip drums

        for n in instrument.notes:
            if start_sec <= n.start <= start_sec + duration_sec:
                all_notes.append({
                    'name': pretty_midi.note_number_to_name(n.pitch),
                    'midi': n.pitch,
                    'time': round(n.start, 5),  # more precision
                    'duration': round(n.end - n.start, 5),
                    'velocity': (n.velocity / 127)
                })

    deduped = []
    seen = set()
    epsilon = 1e-4  # 0.1 ms tolerance

    for note in all_notes:
        key = (note['midi'], round(note['time'] / epsilon))  # quantize time for deduplication
        if key not in seen:
            deduped.append(note)
            seen.add(key)

    deduped.sort(key=lambda x: x['time'])
    grouped = group_simultaneous_notes(deduped)
    
    tempo_bpm = round(extract_tempo_via_mido(file_path),2)

    total_time = round(max(n['time'] + n['duration'] for n in deduped), 2)

    return deduped, tempo_bpm, total_time

# Convert all values to float-compatible
def serialize_note(n):
    return {
        'name': n['name'],
        'midi': n['midi'],
        'time': float(n['time']),
        'duration': float(n['duration']),
        'velocity': n['velocity'],
        'hand': n.get('hand')
    }

def convertWavToMidi(wav_files):
    try:
        predict_and_save([wav_files], save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
        print(f"Conversion successful: {wav_files} → MIDI saved in {save_dir}")
    except Exception as e:\
            print(f"Error: {str(e)}\n")

################################################################################################
save_dir = "../Collection"
file_path = '../Collection/Before Spring Ends_basic_pitch.midi'
output_dir = '../frontend/public/JsonOutputs'

base_name = os.path.splitext(os.path.basename(file_path))[0]        # Get the base filename without extension
os.makedirs(output_dir, exist_ok=True)                              # Make sure the folder exists (create if not)
output_json_path = os.path.join(output_dir, base_name + '.json')    # Full output JSON path with same base name + .json extension

# midiFile = convertWavToMidi(file_path)
# notes, tempo_bpm, total_time = analyze_with_pretty_midi(midiFile)
notes, tempo_bpm, total_time = analyze_with_pretty_midi(file_path)

data = {
    'tempo_bpm': tempo_bpm,
    'total_time': total_time,
    'notes': [serialize_note(n) for n in notes],
}
print(f"Tempo: {tempo_bpm}")
print(f"FileLength(s): {total_time}")
print(f"Total notes found: {len(notes)}")

# Write the JSON file
with open(output_json_path, 'w') as f:
    json.dump(data, f, indent=4)

print(f"JSON saved to {output_json_path}")