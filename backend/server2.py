
# # from fastapi import Request, Query
# from fastapi import FastAPI, HTTPException, UploadFile, File, Form
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import StreamingResponse, JSONResponse, PlainTextResponse
# from pydantic import BaseModel
# import os, threading, traceback
# import torchaudio
# from audiocraft.models import musicgen
# from datetime import datetime
# # from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
# from queue import Queue
# import sys
# import json
# # from music21 import converter, chord, note
# from collections import defaultdict
# import pretty_midi
# import librosa
# import shutil
# import contextlib
# import torch
# import asyncio, re

# from utils.music_utils import analyze_with_pretty_midi, serialize_note, ConvertWavToMidi, ConvertWavToMidiDamRsn, wav_to_json_data

# app = FastAPI()

# # Allow CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # Allow your frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load model once at startup
# os.environ["TRITON_IGNORE"] = "1"
# os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
# model = musicgen.MusicGen.get_pretrained('medium', device='cpu')
# model.set_generation_params(duration=2)

# save_dir = "../Collection"  # .Wav & .MIDI from generator
# os.makedirs(save_dir, exist_ok=True)

# # UPLOAD_DIR = "uploads"  # Any selection of the WavToJson or MidiToJson
# # os.makedirs(UPLOAD_DIR, exist_ok=True)

# output_dir = '../frontend/public/JsonOutputs'   # JsonOutput folder

# @app.get("/check-filename")
# async def check_filename(name: str):
#     import os
#     os.makedirs(save_dir, exist_ok=True)

#     exists = os.path.exists(os.path.join(save_dir, name))
#     return {"exists": exists}

# @app.post("/wavtojson")
# async def wav_to_json(
#     file: UploadFile = File(...),
#     action: str = Form("add_anyway")   # default action
# ):
#     try:
#         save_dir = "../Collection"  # .Wav & .MIDI from generator
#         os.makedirs(save_dir, exist_ok=True)
#         output_dir = '../frontend/public/JsonOutputs'
#         # --- Step 1. Decide where to save input file ---
#         name, ext = os.path.splitext(file.filename)
#         input_path = os.path.join(save_dir, file.filename)

#         if os.path.exists(input_path):
#             if action == "cancel":
#                 return JSONResponse(content={
#                     "status": "cancelled",
#                     "message": "User cancelled conversion"
#                 })
#             elif action == "add_anyway":
#                 counter = 1
#                 while os.path.exists(input_path):
#                     new_filename = f"{name}({counter}){ext}"
#                     input_path = os.path.join(save_dir, new_filename)
#                     counter += 1

#         # --- Step 2. Save uploaded file ---
#         with open(input_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         # --- Step 3. Run conversion (your existing pipeline) ---
#         midiFile, note_count = ConvertWavToMidiDamRsn(input_path, save_dir)
#         # print("midiFile", midiFile)
#         notes, tempo_bpm, total_time = analyze_with_pretty_midi(midiFile)
#         # print("notes", notes)
#         print("note_count", note_count)
#         print("tempo_bpm", tempo_bpm)
#         print("total_time", total_time)

#         # JSON output should match input filename base
#         base_name = os.path.splitext(os.path.basename(input_path))[0]
#         output_json_path = os.path.join(output_dir, re.sub(r'[^a-zA-Z0-9_\-]', '_', base_name) + ".json")

#         data = {
#             "tempo_bpm": tempo_bpm,
#             "total_time": total_time,
#             "notes": [serialize_note(n) for n in notes],
#         }

#         with open(output_json_path, "w") as f:
#             json.dump(data, f, indent=4)

#         print(f"[MSG] JSON saved to {output_json_path}\n")

#         return JSONResponse(content={
#             "status": "ok",
#             "message": f"JSON saved to {output_json_path}",
#             "filename": os.path.basename(input_path),
#             "data": data
#         })

#     except Exception as e:
#         import traceback
#         print("[ERROR] Exception in /wavtojson:")
#         print(traceback.format_exc())
#         return JSONResponse(content={"error": str(e)}, status_code=500)


# @app.post("/miditojson")
# async def midi_to_json(file: UploadFile = File(...),
#     action: str = Form("add_anyway")   # default action
# ):
#     try:
#         # --- Step 1. Decide where to save input file ---
#         name, ext = os.path.splitext(file.filename)
#         input_path = os.path.join(save_dir, file.filename)
#         print("entering midi->json")
#         if os.path.exists(input_path):
#             if action == "cancel":
#                 print("action == cancel")
#                 return JSONResponse(content={
#                     "status": "cancelled",
#                     "message": "User cancelled conversion"
#                 })
#             elif action == "add_anyway":
#                 print("action == add_anyway")
#                 counter = 1
#                 while os.path.exists(input_path):
#                     new_filename = f"{name}({counter}){ext}"
#                     input_path = os.path.join(save_dir, new_filename)
#                     counter += 1

#         # --- Step 2. Save uploaded file ---
#         with open(input_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
#         print("2.Save uploaded file")
#         # --- Step 3. Run conversion (your existing pipeline) ---
#         notes, tempo_bpm, total_time = analyze_with_pretty_midi(input_path)
#         print("3.Run conversion (your existing pipeline)")

#         # JSON output should match input filename base
#         base_name = os.path.splitext(os.path.basename(input_path))[0]
#         output_json_path = os.path.join(output_dir, base_name + ".json")

#         data = {
#             "tempo_bpm": tempo_bpm,
#             "total_time": total_time,
#             "notes": [serialize_note(n) for n in notes],
#         }
#         # if(data.total_time >= 0): print("json written correctly")

#         with open(output_json_path, "w") as f:
#             json.dump(data, f, indent=4)

#         print(f"[MSG] JSON saved to {output_json_path}\n")

#         return JSONResponse(content={
#             "status": "ok",
#             "message": f"JSON saved to {output_json_path}",
#             "filename": os.path.basename(input_path),
#             "data": data
#         })

#     except Exception as e:
#         print("err JSONResponse")
#         return JSONResponse(content={"error": str(e)}, status_code=500)

# class PromptRequest(BaseModel):
#     prompt: str

# @app.get("/generate")
# async def generate_music(prompt: str, filename: str, mididuration: str):
#     print("generate_music called with:", prompt, filename, mididuration)

#     def generate_and_save():
#         try:
#             model.set_generation_params(duration=int(mididuration))
#             inputPrompts = [prompt]

#             print("Calling model.generate()...")
#             res = model.generate(inputPrompts, progress=True)
#             print("model.generate() completed")

#             # Save WAV
#             audio_data = res[0].cpu()
#             safe_filename = filename.replace(" ", "_").replace("/", "_").replace("\\", "_")
#             wav_filename = os.path.join(save_dir, f"{safe_filename}.wav")
#             torchaudio.save(wav_filename, audio_data, 32000)
#             print(f"Audio saved: {wav_filename}")

#             # Unified Pipeline: MIDI conversion + Analysis + JSON creation
#             result_data = wav_to_json_data(wav_filename, save_dir)
            
#             # Save final JSON for frontend (output_dir is defined globally)
#             base_name = os.path.splitext(os.path.basename(wav_filename))[0]
#             output_json_path = os.path.join(output_dir, base_name + '.json')
            
#             with open(output_json_path, 'w') as f:
#                 json.dump(result_data, f, indent=4)
#             print(f"JSON saved: {output_json_path}")

#             return result_data

#         except Exception as e:
#             err_msg = traceback.format_exc()
#             print("Error occurred:\n", err_msg)
#             return {"error": str(e), "traceback": err_msg}

#     # Run heavy job in background thread
#     result = await asyncio.to_thread(generate_and_save)
#     return JSONResponse(content=result)

# @app.get("/test-generate")
# async def test_generate(filename: str):
#     """
#     Test endpoint that skips slow AI generation and uses an existing WAV file.
#     """
#     print(f"test_generate called with existing file: {filename}")
    
#     def process_existing_wav():
#         try:
#             wav_filename = os.path.join(save_dir, f"{filename}.wav")
#             if not os.path.exists(wav_filename):
#                 return {"error": f"WAV file not found: {wav_filename}"}

#             print(f"Using existing audio: {wav_filename}")

#             # Unified Pipeline: MIDI conversion + Analysis + JSON creation
#             result_data = wav_to_json_data(wav_filename, save_dir)
            
#             # Save final JSON for frontend
#             base_name = os.path.splitext(os.path.basename(wav_filename))[0]
#             output_json_path = os.path.join(output_dir, base_name + '.json')
            
#             with open(output_json_path, 'w') as f:
#                 json.dump(result_data, f, indent=4)
#             print(f"JSON saved: {output_json_path}")

#             return result_data

#         except Exception as e:
#             err_msg = traceback.format_exc()
#             return {"error": str(e), "traceback": err_msg}

#     result = await asyncio.to_thread(process_existing_wav)
#     if "error" in result:
#         return JSONResponse(content=result, status_code=404)
#     return JSONResponse(content=result)

# @app.get("/result")
# def get_latest_analysis():
#     try:
#         with open("notes_result.json", "r") as f:
#             return json.load(f)
#     except FileNotFoundError:
#         raise HTTPException(status_code=404, detail="Analysis result not found")
    