#activate the venv first before running
#.venv\Scripts\activate

import os
import torchaudio
import librosa
from audiocraft.models import musicgen
from datetime import datetime
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH

os.environ["TRITON_IGNORE"] = "1"       # Ignore Triton (to avoid the related errors)
save_dir = "../Collection"             #set saved dir
os.makedirs(save_dir, exist_ok=True)

# Load pre-trained MusicGen model
model = musicgen.MusicGen.get_pretrained('medium', device='cuda')
model.set_generation_params(duration=20)

# Generate audio
prompts = [
    # "A solo piano piece in the key of C major, in the style of jazz, simple and slow, beginner-friendly, no accompaniment, no vocals, clear melody and chords only."
    # "A solo piano piece in the key of C major, in the style of classic, 8 bars long, simple and beginner-friendly, slow tempo, loopable, clear melody and chords only, no accompaniment or vocals."
    "A solo piano piece in the chord progression of C major, E major, F major, and G major, in the style of pop music, simple and beginner-friendly, slow tempo, clear melody and chords only, no accompaniment or vocals."
]
res = model.generate(prompts, progress=True)
print(res.shape)  # This will show the shape, e.g., [1, channels, samples]

wav_files = []  # Store generated WAV files for MIDI conversion

for i, (audio_data, prompt) in enumerate(zip(res, prompts)):
    audio_data = audio_data.cpu()   # Use CPU

    # save audiofile
    safe_prompt = prompt.replace(" ", "_").replace(",", "").replace("-", "").replace("/", "")
    timestamp = datetime.now().strftime("%H%M")

    # wav_filename = os.path.join(save_dir,f"{safe_prompt}_{timestamp}({i+1}).wav")
    # wav_filename = os.path.join(save_dir,f"{timestamp}({i+1}).wav")
    wav_filename = os.path.join(save_dir,f"Test{timestamp}({i+1}).wav")
    torchaudio.save(wav_filename, audio_data, 32000)

    wav_files.append(wav_filename)      #Add to list
    print(f"Audio saved as {wav_filename}")

predict_and_save(wav_files, save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
