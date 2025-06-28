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
import pretty_midi
import json
import os
import mido
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
output_dir = '../frontend/public/JsonOutputs'
os.makedirs(save_dir, exist_ok=True)

model = musicgen.MusicGen.get_pretrained('medium', device='cuda')
# model.set_generation_params(duration=2)

def extract_tempo_via_mido(path):
    mid = mido.MidiFile(path)
    for track in mid.tracks:
        for msg in track:
            if msg.type == 'set_tempo':
                return mido.tempo2bpm(msg.tempo)
    return 120.0

def analyze_with_pretty_midi(file_path, start_sec=0, duration_sec=120):
    midi_data = pretty_midi.PrettyMIDI(file_path)
    all_notes = []

    for instrument in midi_data.instruments:
        if instrument.is_drum:
            continue  # skip drums

        for n in instrument.notes:
            if start_sec <= n.start <= start_sec + duration_sec:
                all_notes.append({
                    'name': pretty_midi.note_number_to_name(n.pitch),
                    'midi': n.pitch,
                    'time': round(n.start, 5),  # more precision
                    'duration': round(n.end - n.start, 5),
                    'velocity': (n.velocity / 127)
                })

    deduped = []
    seen = set()
    epsilon = 1e-4  # 0.1 ms tolerance

    for note in all_notes:
        key = (note['midi'], round(note['time'] / epsilon))  # quantize time for deduplication
        if key not in seen:
            deduped.append(note)
            seen.add(key)

    deduped.sort(key=lambda x: x['time'])
    tempo_bpm = round(extract_tempo_via_mido(file_path),2)
    
    total_time = round(max(n['time'] + n['duration'] for n in deduped), 2)

    return deduped, tempo_bpm, total_time

# Convert all values to float-compatible
def serialize_note(n):
    return {
        'name': n['name'],
        'midi': n['midi'],
        'time': float(n['time']),
        'duration': float(n['duration']),
        'velocity': n['velocity']
    }

class PromptRequest(BaseModel):
    prompt: str

@app.get("/generate")
def generate_music(prompt: str, filename: str, mididuration: int):
    model.set_generation_params(duration=mididuration)
    q = Queue()
    # notes_result = []
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
                safe_filename = filename.replace(" ", "_").replace("/", "_").replace("\\", "_")
                wav_filename = os.path.join(save_dir, f"{safe_filename}.wav")   
                torchaudio.save(wav_filename, audio_data, 32000)
                wav_files.append(wav_filename)
                q.put(f"Audio saved: {wav_filename}\n")

            predict_and_save(wav_files, save_dir, True, False, False, False, ICASSP_2022_MODEL_PATH)
            # midi_filename = wav_filename.replace(".wav","_basic_pitch.mid") #locate the midi file name
            original_midi = wav_filename.replace(".wav", "_basic_pitch.mid")
            renamed_midi = wav_filename.replace(".wav", ".mid")
            if os.path.exists(original_midi):
                os.rename(original_midi, renamed_midi)
            midi_filename = renamed_midi

            print("Looking for MIDI file:", midi_filename)
            print("File exists?", os.path.exists(midi_filename))
            print(f"saves {midi_filename} success")

            json_notes, json_tempo_bpm, json_total_time = analyze_with_pretty_midi(midi_filename)
            base_name = os.path.splitext(os.path.basename(midi_filename))[0]
            data = {
                'tempo_bpm': json_tempo_bpm,
                'total_time': json_total_time,
                'notes': [serialize_note(n) for n in json_notes],
            }
            print(f"Tempo: {json_tempo_bpm}")
            print(f"FileLength(s): {json_total_time}")
            print(f"Total notes found: {len(json_notes)}")
            output_json_path = os.path.join(output_dir, base_name + '.json')
            # Write the JSON file
            with open(output_json_path, 'w') as f:
                json.dump(data, f, indent=4)

            print(f"JSON saved to {output_json_path}")

            sys.stdout.flush()
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
    