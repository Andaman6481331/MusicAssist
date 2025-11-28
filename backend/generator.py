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

prompt = (
    # "A solo piano piece in the chord progression of C major, E major, F major, and G major, "
    # "in the style of pop music, simple and beginner-friendly, slow tempo, "
    # "clear melody and chords only, no accompaniment or vocals."
    "Easy pop piano piece in C major, with a simple right-hand melody and left-hand broken chords. Smooth I–V–vi–IV progression, clearly playable with two hands.",
    "Soft piano ballad in G major, slow tempo, clear melody line, and gentle arpeggios. Beginner-friendly and playable with two hands."
)

save_dir = "generated_wav"
os.makedirs(save_dir, exist_ok=True)

for i in range(3):
    res = model.generate([prompt], progress=True)
    audio_data = res[0].cpu()
    timestamp = datetime.now().strftime("%H%M")
    wav_filename = os.path.join(save_dir, f"Test{timestamp}({i+1}).wav")
    torchaudio.save(wav_filename, audio_data, 32000)
    print(f"✅ Audio saved as {wav_filename}")