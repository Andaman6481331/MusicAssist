from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/check-filename")
async def check_filename(name: str):
    # Always pretend it doesn't exist for tests
    return {"exists": False}


@app.get("/generate")
async def generate_music(prompt: str, filename: str, mididuration: int):
    async def stream():
        # Simulate progress updates
        for n in [5, 20, 40, 60, 80, 100]:
            yield f"{n}\n".encode()
            await asyncio.sleep(0.1)
        yield b"done\n"
    return StreamingResponse(stream(), media_type="text/plain")


@app.get("/result")
def get_latest_analysis():
    return JSONResponse(content={"status": "ok"})


