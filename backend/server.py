# server.py
from fastapi import Request
from fastapi import FastAPI
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os, threading, torchaudio
# import librosa
from audiocraft.models import musicgen
from datetime import datetime
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
from queue import Queue
import sys
import io
import contextlib

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
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
save_dir = "../Collection"
os.makedirs(save_dir, exist_ok=True)

model = musicgen.MusicGen.get_pretrained('medium', device='cuda')
model.set_generation_params(duration=8)

class PromptRequest(BaseModel):
    prompt: str

@app.get("/generate")
def generate_music(prompt: str):
    q = Queue()
    def generate_and_capture(prompt):

        class StreamInterceptor:
            def __init__(self, q):
                self.q = q
                self._stdout = sys.stdout

            def write(self, message):
                self._stdout.write(message)  # Also show in real console
                if "/" in message:
                    try:
                        num, total = map(int, message.strip().split("/"))
                        percent = int((num / total) * 100)
                        self.q.put(f"{percent}\n")
                    except:
                        pass
                else:
                    self.q.put(f"{message.strip()}\n")

            def flush(self):
                self._stdout.flush()

        sys.stdout = StreamInterceptor(q)

        q.put(f"Received prompt: {prompt}\n")
        inputPrompts = [prompt]
        print(f"Received prompt: {inputPrompts}")

        try:    
            res = model.generate(inputPrompts, progress=True)
            wav_files = []

            for i, (audio_data, prompt) in enumerate(zip(res, inputPrompts)):
                audio_data = audio_data.cpu()

                # safe_prompt = prompt.replace(" ", "_").replace(",", "").replace("-", "").replace("/", "")
                timestamp = datetime.now().strftime("%H%M")
                wav_filename = os.path.join(save_dir, f"Test{timestamp}({i+1}).wav")
                torchaudio.save(wav_filename, audio_data, 32000)
                wav_files.append(wav_filename)
                q.put(f"Audio saved: {wav_filename}\n")

            predict_and_save(wav_files, save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
            print(f"saves {wav_filename} success")

            q.put("done\n")

        except Exception as e:
            q.put(f"Error: {str(e)}\n")

        finally:
            q.put(None)
    
    threading.Thread(target=generate_and_capture, args=(prompt,)).start()

    def stream():
        while True:
            line = q.get()
            if line is None:
                break
            yield line

        
    return StreamingResponse(stream(), media_type="text/plain")
