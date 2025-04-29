# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import torchaudio
import librosa
from audiocraft.models import musicgen
from datetime import datetime
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
os.environ["TRITON_IGNORE"] = "1"
save_dir = "../Collection"
os.makedirs(save_dir, exist_ok=True)

model = musicgen.MusicGen.get_pretrained('medium', device='cuda')
model.set_generation_params(duration=8)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_music(data: PromptRequest):
    inputPrompts = [data.prompt]
    print(f"Received prompt: {inputPrompts}")

    res = model.generate(inputPrompts, progress=True)
    wav_files = []

    for i, (audio_data, prompt) in enumerate(zip(res, inputPrompts)):
        audio_data = audio_data.cpu()

        safe_prompt = prompt.replace(" ", "_").replace(",", "").replace("-", "").replace("/", "")
        timestamp = datetime.now().strftime("%H%M")
        wav_filename = os.path.join(save_dir, f"Test{timestamp}({i+1}).wav")
        torchaudio.save(wav_filename, audio_data, 32000)

        wav_files.append(wav_filename)
        print(f"Audio saved as {wav_filename}")

    predict_and_save(wav_files, save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)

    return {"status": "success", "files": wav_files}
