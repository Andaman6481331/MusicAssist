
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
import os

save_dir = "../Collection"
os.makedirs(save_dir, exist_ok=True)

def convertWavToMidi(wav_file: str):
    try:
        # predict_and_save(
        #     [wav_file],
        #     save_dir,
        #     True,           # Save MIDI file
        #     False, # Don't save internal model outputs
        #     False,         # Don't save note JSON separately
        #     False,         # Don't save audio outputs
        #     ICASSP_2022_MODEL_PATH,
        # )
        predict_and_save(
            [wav_file],
            save_dir,
            True,           # Save MIDI file
            False,          # Don't save internal model outputs
            False,         # Don't save note JSON separately
            False,         # Don't save audio outputs
            ICASSP_2022_MODEL_PATH,
            80,     # Ignore very low notes
            1000,   # Ignore very high notes
            0.6,      # Higher → stricter note starts
            0.4,      # Higher → stricter note frames
            100,  # Minimum note duration in ms
        )
        print(f"✅ Conversion successful: {wav_file} → MIDI saved in {save_dir}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

convertWavToMidi("../Collection/Koon_p.wav")


