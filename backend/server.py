from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, PlainTextResponse
from pydantic import BaseModel
import os, threading, traceback
from datetime import datetime
from queue import Queue
import sys
import json
from collections import defaultdict
import shutil
import contextlib
import asyncio, re
import requests as http_requests

import replicate
from dotenv import load_dotenv

# Load .env (REPLICATE_API_TOKEN)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from utils.music_utils import (
    analyze_with_pretty_midi, serialize_note,
    ConvertWavToMidi, 
    # ConvertWavToMidiDamRsn,
    wav_to_json_data, estimate_key_from_audio,
)

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

save_dir = "../Collection"  # .Wav & .MIDI from generator
os.makedirs(save_dir, exist_ok=True)

output_dir = '../frontend/public/JsonOutputs'   # JsonOutput folder

# ============================================
# Generation lock to prevent multiple simultaneous generations
# ============================================
generation_lock = asyncio.Lock()
is_generating = False

@app.get("/check-filename")
async def check_filename(name: str):
    """
    Check if a filename already exists in the Collection directory.
    Checks for both .mp3, .wav and .mid files.
    """
    os.makedirs(save_dir, exist_ok=True)
    
    wav_exists = os.path.exists(os.path.join(save_dir, f"{name}.wav"))
    mp3_exists = os.path.exists(os.path.join(save_dir, f"{name}.mp3"))
    mid_exists = os.path.exists(os.path.join(save_dir, f"{name}.mid"))
    
    return {
        "exists": wav_exists or mp3_exists or mid_exists,
        "wav_exists": wav_exists,
        "mp3_exists": mp3_exists,
        "mid_exists": mid_exists
    }

@app.get("/generation-status")
async def generation_status():
    """
    Check if a generation is currently in progress.
    """
    global is_generating
    return {"is_generating": is_generating}

@app.post("/wavtojson")
async def wav_to_json(
    file: UploadFile = File(...),
    action: str = Form("add_anyway"),
    onset: float = Form(0.4),
    frame: float = Form(0.2),
    min_len: int = Form(60)
):
    """
    Convert an uploaded WAV/MP3 file to MIDI and then to JSON.
    Allows tuning Basic Pitch accuracy via Form parameters.
    """
    print(f"wav_to_json called with: {file.filename}, action: {action}")

    # 1. Sanitize and prepare paths
    filename = file.filename
    name, ext = os.path.splitext(filename)
    # Basic sanitize
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
    input_path = os.path.join(save_dir, f"{safe_name}{ext}")

    # Handle existing files
    if os.path.exists(input_path):
        if action == "cancel":
            return JSONResponse(content={"status": "cancelled", "message": "User cancelled"}, status_code=200)
        elif action == "add_anyway":
            counter = 1
            while os.path.exists(input_path):
                input_path = os.path.join(save_dir, f"{safe_name}({counter}){ext}")
                counter += 1

    # 2. Save the uploaded file
    os.makedirs(save_dir, exist_ok=True)
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    def process_wav():
        try:
            # 3. Use unified pipeline with optional threshold overrides
            result_data = wav_to_json_data(
                input_path, 
                save_dir, 
                onset_threshold=onset, 
                frame_threshold=frame, 
                minimum_note_length=min_len
            )

            # 4. Save final JSON for frontend
            os.makedirs(output_dir, exist_ok=True)
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_json_path = os.path.join(output_dir, base_name + '.json')

            with open(output_json_path, 'w') as f:
                json.dump(result_data, f, indent=4)
            
            print(f"[INFO] JSON saved: {output_json_path}")
            return result_data
        except Exception as e:
            err_msg = traceback.format_exc()
            print("Error in process_wav:\n", err_msg)
            return {"error": str(e), "traceback": err_msg}

    # Run in thread to be non-blocking
    result = await asyncio.to_thread(process_wav)

    if "error" in result:
        return JSONResponse(content=result, status_code=500)

    return JSONResponse(content=result)


@app.post("/miditojson")
async def midi_to_json(
    file: UploadFile = File(...),
    action: str = Form("add_anyway")
):
    """
    Convert an uploaded MIDI file to JSON.
    Structure similar to /generate.
    """
    print(f"midi_to_json called with: {file.filename}, action: {action}")

    # 1. Sanitize and prepare paths
    filename = file.filename
    name, ext = os.path.splitext(filename)
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
    input_path = os.path.join(save_dir, f"{safe_name}{ext}")

    # Handle existing files
    if os.path.exists(input_path):
        if action == "cancel":
            return JSONResponse(content={"status": "cancelled", "message": "User cancelled"}, status_code=200)
        elif action == "add_anyway":
            counter = 1
            while os.path.exists(input_path):
                input_path = os.path.join(save_dir, f"{safe_name}({counter}){ext}")
                counter += 1

    # 2. Save the uploaded file
    os.makedirs(save_dir, exist_ok=True)
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    def process_midi():
        try:
            # 3. Analyze MIDI (no source audio available for MIDI-only uploads,
            #    so tempo defaults to MIDI set_tempo or 120 BPM)
            notes, tempo_bpm, total_time = analyze_with_pretty_midi(
                input_path, audio_path=None
            )

            note_density = round(len(notes) / total_time, 2) if total_time > 0 else 0.0

            result_data = {
                "status":        "ok",
                "audio_source":  "midi",
                "tempo_bpm":     tempo_bpm,
                "total_time":    total_time,
                "key_signature": "Unknown",  # no audio = no chroma analysis
                "note_count":    len(notes),
                "note_density":  note_density,
                "notes":         [serialize_note(n) for n in notes],
                "midi_filename": os.path.basename(input_path),
            }

            # 4. Save final JSON for frontend
            os.makedirs(output_dir, exist_ok=True)
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_json_path = os.path.join(output_dir, base_name + '.json')

            with open(output_json_path, 'w') as f:
                json.dump(result_data, f, indent=4)

            print(f"[INFO] JSON saved: {output_json_path}")
            return result_data
        except Exception as e:
            err_msg = traceback.format_exc()
            print("Error in process_midi:\n", err_msg)
            return {"error": str(e), "traceback": err_msg}

    # Run in thread
    result = await asyncio.to_thread(process_midi)

    if "error" in result:
        return JSONResponse(content=result, status_code=500)

    return JSONResponse(content=result)

class PromptRequest(BaseModel):
    prompt: str

@app.get("/generate")
async def generate_music(
    prompt: str, 
    filename: str, 
    mididuration: str,
    onset: float = 0.4,
    frame: float = 0.2,
    min_len: int = 60
):
    """
    Generate music via Replicate MusicGen API and convert to JSON MIDI.
    Allows tuning conversion accuracy via query parameters.
    """
    global is_generating

    print("generate_music called with:", prompt, filename, mididuration)

    # Check if generation is already in progress
    if is_generating:
        return JSONResponse(
            content={
                "error": "A generation is already in progress. Please wait for it to complete."
            },
            status_code=409
        )

    # Sanitise filename
    safe_filename = filename.replace(" ", "_").replace("/", "_").replace("\\", "_")
    wav_path = os.path.join(save_dir, f"{safe_filename}.wav")
    mid_path = os.path.join(save_dir, f"{safe_filename}.mid")

    if os.path.exists(wav_path) or os.path.exists(mid_path):
        return JSONResponse(
            content={
                "error": f"Filename '{safe_filename}' already exists. Please choose a different name."
            },
            status_code=409
        )

    def generate_and_save():
        global is_generating
        try:
            is_generating = True

            # ------------------------------------------------------------------
            # Step 1 — Replicate MusicGen API call
            # ------------------------------------------------------------------
            print("[REPLICATE] Calling MusicGen API...")
            try:
                output = replicate.run(
                    "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
                    input={
                        "prompt": prompt,
                        "duration": int(mididuration),
                        "model_version": "stereo-melody-large",
                        "output_format": "wav",
                        "temperature": 0.75,   # Lower for more stable, clear notes
                        "top_k": 50,           # Filter out unlikely/noisy sounds
                        "top_p": 0.9,   
                        "normalization_strategy": "peak",
                    }
                )
            except Exception as e:
                print(f"[ERROR] Replicate direct call failed: {e}")
                # Check for common connection errors and provide more help
                if "getaddrinfo failed" in str(e):
                    return {
                        "error": "Backend could not reach Replicate API (DNS error). Please check your internet connection or proxy settings.",
                        "traceback": traceback.format_exc()
                    }
                raise e

            print("[REPLICATE] Generation complete. Downloading output...")

            # ------------------------------------------------------------------
            # Step 2 — Download result from Replicate URL or File object
            # ------------------------------------------------------------------
            os.makedirs(save_dir, exist_ok=True)
            
            # Handle different output types from Replicate API
            audio_bytes = None
            if hasattr(output, "read"):
                # It's a file-like object
                audio_bytes = output.read()
            elif isinstance(output, str) and output.startswith("http"):
                # It's a URL string
                resp = http_requests.get(output)
                resp.raise_for_status()
                audio_bytes = resp.content
            elif isinstance(output, list) and len(output) > 0 and isinstance(output[0], str):
                # It's a list of URLs
                resp = http_requests.get(output[0])
                resp.raise_for_status()
                audio_bytes = resp.content
            else:
                raise Exception(f"Unexpected output format from Replicate: {type(output)}")

            with open(wav_path, "wb") as f:
                f.write(audio_bytes)
            print(f"[INFO] WAV saved: {wav_path}")

            # ------------------------------------------------------------------
            # Step 3 & 4 — BasicPitch MP3→MIDI, pretty_midi MIDI→JSON
            # ------------------------------------------------------------------
            result_data = wav_to_json_data(
                wav_path, 
                save_dir, 
                onset_threshold=onset, 
                frame_threshold=frame, 
                minimum_note_length=min_len
            )

            # Save final JSON for frontend
            os.makedirs(output_dir, exist_ok=True)
            base_name = os.path.splitext(os.path.basename(wav_path))[0]
            output_json_path = os.path.join(output_dir, base_name + '.json')

            with open(output_json_path, 'w') as f:
                json.dump(result_data, f, indent=4)
            print(f"[INFO] JSON saved: {output_json_path}")

            return result_data

        except Exception as e:
            err_msg = traceback.format_exc()
            print("Error occurred:\n", err_msg)
            return {"error": str(e), "traceback": err_msg}
        finally:
            is_generating = False

    # Acquire lock and run generation in a thread (non-blocking)
    async with generation_lock:
        result = await asyncio.to_thread(generate_and_save)

    if "error" in result:
        return JSONResponse(content=result, status_code=500)

    return JSONResponse(content=result)


@app.get("/test-generate")
async def test_generate(
    filename: str,
    onset: float = 0.4,
    frame: float = 0.2,
    min_len: int = 60
):
    """
    Test endpoint with threshold overrides.
    """
    print(f"test_generate called with: {filename}, onset={onset}, frame={frame}")

    def process_existing_audio():
        try:
            # Try MP3 first, then WAV
            # Try WAV first, then MP3
            for ext in (".wav", ".mp3"):
                audio_path = os.path.join(save_dir, f"{filename}{ext}")
                if os.path.exists(audio_path):
                    break
            else:
                return {"error": f"Audio file not found: {filename}.wav / {filename}.mp3"}

            print(f"Using existing audio: {audio_path}")

            # Unified Pipeline: MIDI conversion + Analysis + JSON creation
            result_data = wav_to_json_data(
                audio_path, 
                save_dir, 
                onset_threshold=onset, 
                frame_threshold=frame, 
                minimum_note_length=min_len
            )

            # Save final JSON for frontend
            base_name = os.path.splitext(os.path.basename(audio_path))[0]
            output_json_path = os.path.join(output_dir, base_name + '.json')

            with open(output_json_path, 'w') as f:
                json.dump(result_data, f, indent=4)
            print(f"JSON saved: {output_json_path}")

            return result_data

        except Exception as e:
            err_msg = traceback.format_exc()
            return {"error": str(e), "traceback": err_msg}

    result = await asyncio.to_thread(process_existing_audio)
    if "error" in result:
        return JSONResponse(content=result, status_code=404)
    return JSONResponse(content=result)


@app.get("/result")
def get_latest_analysis():
    try:
        with open("notes_result.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Analysis result not found")