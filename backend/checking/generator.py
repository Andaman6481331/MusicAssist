#activate the venv first before running
#.venv\Scripts\activate
import os
import torchaudio
from audiocraft.models import musicgen
from datetime import datetime
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH

os.environ["TRITON_IGNORE"] = "1"       # Ignore Triton (to avoid the related errors)


# Load pre-trained MusicGen model
model = musicgen.MusicGen.get_pretrained('medium', device='cuda')
model.set_generation_params(duration=10)

# Generate audio

# predict_and_save(wav_files, save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)

prompt = """Solo acoustic piano only.
No other instruments.
Slow to moderate tempo (60–85 BPM).
Very clear note separation.
No sustain pedal.
Short note durations with clean attacks and clear endings.
Simple rhythm.
Minimal overlapping notes.
Mostly block chords and single-note melody.
No fast runs, no ornamentation.
Dry studio recording sound, no reverb.
Educational style, easy to transcribe."""

save_dir = "generated_wav"
os.makedirs(save_dir, exist_ok=True)

for i in range(3):
    res = model.generate([prompt], progress=True)
    audio_data = res[0].cpu()
    timestamp = datetime.now().strftime("%H%M")
    wav_filename = os.path.join(save_dir, f"Test{timestamp}({i+1}).wav")
    torchaudio.save(wav_filename, audio_data, 32000)
    print(f"✅ Audio saved as {wav_filename}")