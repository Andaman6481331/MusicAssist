import os
import librosa
import soundfile as sf
from basic_pitch.inference import predict, Model
from basic_pitch import ICASSP_2022_MODEL_PATH

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
        onset_threshold=0.35,
        frame_threshold=0.25,
        minimum_note_length=50,
        minimum_frequency=30,
        maximum_frequency=3000
    )
    
    # 3️⃣ Save MIDI
    output_midi_path = os.path.join(save_dir, os.path.basename(wav_file).replace(".wav", ".mid"))
    midi_data.write(output_midi_path)
    
    return output_midi_path, len(note_events)

save_dir = "../Collection"
wav_file = "../Collection/cccprompt.wav"

midi_path, note_count = ConvertWavToMidi(wav_file, save_dir)
print(f"MIDI saved at: {midi_path}, total notes: {note_count}")