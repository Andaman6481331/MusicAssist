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
model.set_generation_params(duration=8)

# Generate audio
prompts = [
    # 'A simple solo piano performance featuring soft chord comping. The chords are played in a smooth, rhythmic pattern, suitable for jazz or pop ballads. The piece is slow and relaxed, with gentle harmonic movement.',
    # 'A solo piano piece playing rich block chords with a warm, emotional tone. The chords are played on every beat, creating a steady harmonic foundation, similar to classic jazz and pop accompaniment styles.',
    # 'A solo piano composition with expressive broken chords and arpeggios. The left hand plays flowing arpeggios while the right hand plays simple melodic figures. The music is emotional, with a gentle, cinematic feel.',
    # 'A solo piano ballad featuring open chord voicings and a slow, emotional progression. The chords are played softly, with occasional arpeggios and gentle melodic movements.'
    # 'Played in key C, no drums, no bass, only piano accompaniment, A solo piano piece featuring gentle broken chords in the left hand and a simple right-hand melody. The performance is soft, emotional, and flowing, similar to classical and cinematic piano music. No drums, no bass, only piano accompaniment',
    'A solo piano performance featuring steady block chords. The chords are played with a warm, rhythmic feel, providing a strong harmonic foundation. The piece is minimalistic and structured, suitable for pop or gospel piano accompaniment. No melody, only block chord comping.',
    # 'A solo jazz piano piece featuring broken chords played in a relaxed swing feel. The left hand plays soft, syncopated broken chords while the right hand plays sparse, tasteful embellishments. Smooth and lounge-like, reminiscent of Bill Evans or Oscar Peterson. No melody, just chord accompaniment.',
    # 'A solo piano performance with delicate broken chords, played in an elegant and expressive manner. The arpeggios are fluid and dynamic, creating a rich harmonic movement. Inspired by romantic classical piano pieces like Chopin’s nocturnes. No melody, just harmonic arpeggios.'
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
