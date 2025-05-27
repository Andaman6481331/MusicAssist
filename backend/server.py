# server.py
# from fastapi import Request, Query
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os, threading, torchaudio
from audiocraft.models import musicgen
from datetime import datetime
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
from queue import Queue
import sys
import json
from music21 import converter, chord, note
from collections import defaultdict
# import librosa
# import io
# import contextlib

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
model.set_generation_params(duration=2)

def analyze_and_group_notes(file_path):
    score = converter.parse(file_path)
    raw_notes = []

    # Step 1: Extract individual notes from all parts
    for part in score.parts:
        for element in part.flat.notes:
            if isinstance(element, note.Note):
                raw_notes.append({
                    "name": element.nameWithOctave,
                    "midi": element.pitch.midi,
                    "time": round(float(element.offset), 2),
                    "duration": round(float(element.quarterLength), 2),
                    "velocity": 64  # Placeholder value
                })

    # Step 2: Group notes by start time (within a small threshold)
    grouped_notes = defaultdict(list)
    time_threshold = 0.05  # Notes within 50ms are considered simultaneous

    for note_obj in raw_notes:
        inserted = False
        for group_time in grouped_notes:
            if abs(note_obj["time"] - group_time) <= time_threshold:
                grouped_notes[group_time].append(note_obj)
                inserted = True
                break
        if not inserted:
            grouped_notes[note_obj["time"]].append(note_obj)

    # Step 3: Optionally assign left/right hand and format output
    result = []
    for group_time in sorted(grouped_notes.keys()):
        group = grouped_notes[group_time]
        for note_obj in group:
            note_obj["hand"] = "left" if note_obj["midi"] < 60 else "right"
        result.extend(group)

    return result

class PromptRequest(BaseModel):
    prompt: str

@app.get("/generate")
def generate_music(prompt: str):
    q = Queue()
    notes_result = []
    def generate_and_capture(prompt):

        class StreamInterceptor:
            def __init__(self, q):
                self.q = q
                self._stdout = sys.stdout

            def write(self, message):
                self._stdout.write(message)  # Also show in real console
                msg = message.strip()
                if "/" in message:
                    try:
                        num, total = map(int, message.strip().split("/"))
                        percent = int((num / total) * 100)
                        self.q.put(f"{percent}\n")
                    except:
                        self.q.put(f"[MSG] {msg}\n")
                else:
                    self.q.put(f"[MSG] {msg}\n")

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
            midi_filename = wav_filename.replace(".wav","_basic_pitch.mid") #locate the midi file name
            print("Looking for MIDI file:", midi_filename)
            print("File exists?", os.path.exists(midi_filename))
            print(f"saves {midi_filename} success")

            notes = analyze_and_group_notes(midi_filename)
            notes_result.extend(notes)
            print("Notes extracted:", len(notes))

            sys.stdout.flush()

            try:
                json.dumps(notes)
                with open("notes_result.json", "w") as f:
                    json.dump(notes, f)
                print("Dumped JSON successfully", flush=True)
                q.put("done\n")
            except Exception as e:
                q.put(f"Error dumping JSON: {e}\n")

        except Exception as e:\
            q.put(f"Error: {str(e)}\n")

        finally:
            q.put("done\n")
            q.put(None)
    
    threading.Thread(target=generate_and_capture, args=(prompt,)).start()

    def stream():
        while True:
            line = q.get()
            if line is None:
                break
            yield line

        
    return StreamingResponse(stream(), media_type="text/plain")

@app.get("/result")
def get_latest_analysis():
    try:
        with open("notes_result.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Analysis result not found")

