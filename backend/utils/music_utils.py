import mido
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
import pretty_midi, os

save_dir = "../Collection"

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

def convertWavToMidi(wav_files):
    try:
        predict_and_save([wav_files], save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
        print(f"Conversion successful: {wav_files}")

        midi_path = os.path.join(save_dir, os.path.splitext(os.path.basename(wav_files))[0] + "_basic_pitch.mid")
        return midi_path
    except Exception as e:\
            print(f"Error: {str(e)}\n")