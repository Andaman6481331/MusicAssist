import pretty_midi
import json
import os
import mido

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
    tempo_bpm = round(extract_tempo_via_mido(file_path),2)
    # total_time = round(max(note.end),2)

    # mid = mido.MidiFile(file_path)
    # for msg in mid.tracks[0]:
    #     if msg.type == 'set_tempo':
    #         tempo_bpm = mido.tempo2bpm(msg.tempo)
    #     else:
    #         tempo_bpm = 120.0

    total_time = round(max(n['time'] + n['duration'] for n in deduped), 2)

    return deduped, tempo_bpm, total_time

# Convert all values to float-compatible
def serialize_note(n):
    return {
        'name': n['name'],
        'midi': n['midi'],
        'time': float(n['time']),
        'duration': float(n['duration']),
        'velocity': n['velocity']
    }

################################################################################################
# file_path = '../Collection/river_flow_in_you.mid'
# file_path = '../Collection/thisGame.mid'
# file_path = '../Collection/Perfect.mid'
file_path = '../Collection/sparkle.mid'
output_dir = '../frontend/public/JsonOutputs'

base_name = os.path.splitext(os.path.basename(file_path))[0]        # Get the base filename without extension
os.makedirs(output_dir, exist_ok=True)                              # Make sure the folder exists (create if not)
output_json_path = os.path.join(output_dir, base_name + '.json')    # Full output JSON path with same base name + .json extension

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