import mido
# from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
import pretty_midi, os
import librosa
import soundfile as sf
from basic_pitch.inference import predict, Model
from basic_pitch import ICASSP_2022_MODEL_PATH



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
    tempo_bpm = round(extract_tempo_via_mido(file_path), 2)
    
    # Handle empty notes to avoid ValueError: max() arg is an empty sequence
    total_time = round(max(n['time'] + n['duration'] for n in deduped), 2) if deduped else 0.0

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

# def convertWavToMidi(wav_files):
#     try:
#         predict_and_save([wav_files], save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
#         print(f"Conversion successful: {wav_files}")

#         midi_path = os.path.join(save_dir, os.path.splitext(os.path.basename(wav_files))[0] + "_basic_pitch.mid")
#         return midi_path
#     except Exception as e:\
#             print(f"Error: {str(e)}\n")

# Load model once globally
model = Model(ICASSP_2022_MODEL_PATH)

def ConvertWavToMidi(wav_file: str, save_dir: str):
    """
    Convert a WAV file to MIDI using Basic-Pitch with preprocessing.
    
    Parameters:
        wav_file (str): Path to input WAV file.
        save_dir (str): Directory to save the MIDI file.
        
    Returns:
        tuple[str, int]: (Path to saved MIDI, number of notes detected)
    """
    os.makedirs(save_dir, exist_ok=True)
    
    # Processed WAV path
    processed_path = os.path.join(save_dir, "processed_" + os.path.basename(wav_file))
    
    # 1️⃣ Load and preprocess audio
    y, sr = librosa.load(wav_file, sr=22050, mono=True)
    y = y / max(abs(y))                        # Normalize
    y = librosa.effects.preemphasis(y, coef=0.97)  # Boost attack
    y, _ = librosa.effects.trim(y, top_db=30) # Trim silence
    
    sf.write(processed_path, y, sr)
    
    # 2️⃣ Predict notes / MIDI
    model_output, midi_data, note_events = predict(
        audio_path=processed_path,
        model_or_model_path=model,
        onset_threshold=0.7,        # mini length can be high, priority at the 2 thres
        frame_threshold=0.5,
        minimum_note_length=120,
        minimum_frequency=55,
        maximum_frequency=1700
    )
    
    # 3️⃣ Save MIDI
    output_midi_path = os.path.join(save_dir, os.path.basename(wav_file).replace(".wav", ".mid"))
    midi_data.write(output_midi_path)
    
    return output_midi_path, len(note_events)

#pip install onnxruntime
def ConvertWavToMidiDamRsn(wav_file: str, save_dir: str, 
                            note_sensitivity: float = 0.8,
                            split_sensitivity: float = 0.6,
                            min_note_duration_ms: float = 120):
    """
    Convert a WAV file to MIDI using the DamRsn ONNX model.
    
    Parameters:
        wav_file (str): Path to input WAV file.
        save_dir (str): Directory to save the MIDI file.
        note_sensitivity (float): Note detection threshold (0.05-0.95). Higher = more notes.
        split_sensitivity (float): Note splitting threshold (0.05-0.95). Higher = more splits.
        min_note_duration_ms (float): Minimum note duration in milliseconds.
        
    Returns:
        tuple[str, int]: (Path to saved MIDI, number of notes detected)
    """
    try:
        import onnxruntime as ort
        import numpy as np
    except ImportError:
        raise ImportError("Please install onnxruntime: pip install onnxruntime")
    
    print(f"[DEBUG] Starting ConvertWavToMidiDamRsn for {wav_file}")
    os.makedirs(save_dir, exist_ok=True)
    
    # Load and preprocess audio
    y, sr = librosa.load(wav_file, sr=22050, mono=True)
    y = y / (max(abs(y)) + 1e-8)  # Normalize with epsilon
    y = librosa.effects.preemphasis(y, coef=0.97)  # Boost attack
    y, _ = librosa.effects.trim(y, top_db=30)  # Trim silence
    
    # Load ONNX model (Keeping this for future use as requested, but currently using basic-pitch fallback)
    model_path = os.path.join(
        os.path.dirname(__file__), 
        "../DamRsn/ModelData/features_model.onnx"
    )
    
    # Inference stub - currently basic-pitch is more reliable for MIDI generation
    if model is None:
        raise ImportError("basic-pitch model is not initialized!")
    
    # Create temporary processed file for basic-pitch
    processed_path = os.path.join(save_dir, "temp_" + os.path.basename(wav_file))
    sf.write(processed_path, y, sr)
    
    try:
        # 2️⃣ Predict notes / MIDI using basic-pitch
        model_output, midi_data, note_events = predict(
            audio_path=processed_path,
            model_or_model_path=model,
            onset_threshold=note_sensitivity,
            frame_threshold=split_sensitivity,
            minimum_note_length=int(min_note_duration_ms),
            minimum_frequency=55,
            maximum_frequency=1700
        )
        
        # 3️⃣ Save MIDI
        output_midi_path = os.path.join(save_dir, os.path.basename(wav_file).replace(".wav", ".mid"))
        midi_data.write(output_midi_path)
        
        return output_midi_path, len(note_events)
    finally:
        # Clean up temp file
        if os.path.exists(processed_path):
            os.remove(processed_path)

def wav_to_json_data(wav_path: str, save_dir: str):
    """
    Cleaner unified pipeline: WAV -> MIDI -> JSON Data (Dict)
    """
    print(f"[PROCESS] Running WAV->MIDI->JSON pipeline for: {wav_path}")
    
    # 1. Convert WAV to MIDI
    midi_path, note_count = ConvertWavToMidiDamRsn(wav_path, save_dir)
    print(f"[INFO] MIDI conversion complete. {note_count} notes detected.")
    
    # 2. Analyze MIDI
    notes, tempo_bpm, total_time = analyze_with_pretty_midi(midi_path)
    
    if not notes:
        print(f"[WARNING] No notes detected in {wav_path}. Check audio volume/duration.")

    # 3. Format result
    return {
        "status": "ok",
        "tempo_bpm": tempo_bpm,
        "total_time": total_time,
        "notes": [serialize_note(n) for n in notes],
        "note_count": note_count,
        "midi_filename": os.path.basename(midi_path)
    }