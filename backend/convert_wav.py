from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
import os

save_dir = "../Collection"
os.makedirs(save_dir, exist_ok=True)

def convertWavToMidi(wav_files):
    try:
        predict_and_save([wav_files], save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
        print(f"Conversion successful: {wav_files} → MIDI saved in {save_dir}")
    except Exception as e:\
            print(f"Error: {str(e)}\n")
        
convertWavToMidi("../Collection/Before Spring Ends.wav")