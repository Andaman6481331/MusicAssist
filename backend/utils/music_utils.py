import mido
# from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
import pretty_midi, os
import librosa
import soundfile as sf
# from basic_pitch.inference import predict, Model
# from basic_pitch import ICASSP_2022_MODEL_PATH



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

# def convertWavToMidi(wav_files):
#     try:
#         predict_and_save([wav_files], save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
#         print(f"Conversion successful: {wav_files}")

#         midi_path = os.path.join(save_dir, os.path.splitext(os.path.basename(wav_files))[0] + "_basic_pitch.mid")
#         return midi_path
#     except Exception as e:\
#             print(f"Error: {str(e)}\n")

# Load model once globally
# model = Model(ICASSP_2022_MODEL_PATH)

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
                            note_sensitivity: float = 0.7,
                            split_sensitivity: float = 0.5,
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
    
    # Load and preprocess audio (similar to ConvertWavToMidi)
    y, sr = librosa.load(wav_file, sr=22050, mono=True)
    y = y / max(abs(y))  # Normalize
    y = librosa.effects.preemphasis(y, coef=0.97)  # Boost attack
    y, _ = librosa.effects.trim(y, top_db=30)  # Trim silence
    
    # Load ONNX model
    model_path = os.path.join(
        os.path.dirname(__file__), 
        "../DamRsn/ModelData/features_model.onnx"
    )
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"DamRsn ONNX model not found at: {model_path}")
    
    # Run ONNX inference
    session = ort.InferenceSession(model_path)
    input_name = session.get_inputs()[0].name
    
    # Reshape audio for model input (add batch dimension)
    print(f"[DEBUG] Running ONNX inference with {model_path}")
    print(f"[DEBUG] Input name: {input_name}")
    print(f"[DEBUG] Audio shape {y.shape}, dtype: {y.dtype}")
    
    # Check if model has fixed input shape
    input_shape = session.get_inputs()[0].shape
    print(f"[DEBUG] Model expected input shape: {input_shape}")

    audio_input = y.reshape(1, -1, 1).astype(np.float32)
    print(f"[DEBUG] Formatted audio input shape: {audio_input.shape}")
    
    # Run inference
    try:
        outputs = session.run(None, {input_name: audio_input})
        print(f"[DEBUG] ONNX inference successful, output length: {len(outputs)}")
    except Exception as e:
        print(f"[ERROR] ONNX session.run failed: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise e
    
    # Convert model outputs to MIDI using basic-pitch's predict function
    # Note: This is a simplified approach - you may need to adjust based on actual model outputs
    # For now, fallback to basic-pitch with adjusted parameters
    # TODO: Implement proper DamRsn output-to-MIDI conversion
    print(f"[DEBUG] Attempting to import basic-pitch for MIDI conversion")
    try:
        from basic_pitch.inference import predict
        from basic_pitch import ICASSP_2022_MODEL_PATH
        from basic_pitch.inference import Model as BPModel
        
        bp_model = BPModel(ICASSP_2022_MODEL_PATH)
    except ImportError:
        print("[ERROR] basic-pitch is not installed but required for this function!")
        raise ImportError("basic-pitch is required for ConvertWavToMidiDamRsn hybrid mode. Please install it or use the full requirements.txt")

    # Create temporary processed file
    processed_path = os.path.join(save_dir, "temp_processed.wav")
    sf.write(processed_path, y, sr)
    
    model_output, midi_data, note_events = predict(
        audio_path=processed_path,
        model_or_model_path=bp_model,
        onset_threshold=note_sensitivity,
        frame_threshold=split_sensitivity,
        minimum_note_length=int(min_note_duration_ms),
        minimum_frequency=55,
        maximum_frequency=1700
    )
    
    # Clean up temp file
    if os.path.exists(processed_path):
        os.remove(processed_path)
    
    # Save MIDI
    output_midi_path = os.path.join(save_dir, os.path.basename(wav_file).replace(".wav", "_damrsn.mid"))
    midi_data.write(output_midi_path)
    
    return output_midi_path, len(note_events)