# 🎹 Harmonic (MusicAssist)

Harmonic is an AI-powered music assistant designed to empower musicians through advanced music theory tools, interactive piano visualizations, and AI-driven music generation. Whether you're a student learning the ropes or a professional looking for inspiration, Harmonic provides a suite of tools to enhance your musical journey.

---

## 🚀 Key Features

*We keep our README lightweight for fast loading. Want to see our interactive UI, AI generation, and audio processing in action?*

### 🎬 [👉 CLICK HERE TO VIEW THE FULL VIDEO SHOWCASE 👈](./SHOWCASE.md)

- **AI Music Generation**: Create original music from user choices using Replicate's MusicGen API.
- **WAV/MP3 to MIDI/JSON**: Convert audio recordings into structured musical data for analysis.
- **Interactive Piano Roll**: Visualize and play back musical compositions in real-time.
- **Music Theory Academy**: Structured lessons and interactive tools for learning music theory.
- **Sample Playback**: High-quality piano samples powered by Tone.js.
- **Global Theme System**: Fully customizable UI with multiple vibrant themes.

---

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), Vite, Tone.js, Firebase.
- **Backend**: Python (FastAPI), Uvicorn, BasicPitch, pretty_midi.
- **AI Integration**: Replicate (MusicGen).

---

## 📥 Installation

### Prerequisites
- **Python 3.9+**: Required for backend processing.
- **Node.js (LTS)**: Required for the frontend development server.

### 1. Backend Setup
Navigate to the `backend` directory and set up a virtual environment:

#### **Windows**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

#### **macOS / Linux**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### **Environment Variables**
Create a `.env` file in the `backend` directory:
```env
REPLICATE_API_TOKEN=your_token_here
```

---

### 2. Frontend Setup
Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

---

### 3. Root Setup
Install dependencies in the project root to enable the combined start scripts:

```bash
cd ..
npm install
```

---

## 🏃 How to Run

After completing the installation, you can run both the frontend and backend simultaneously using a single command from the project root.

### **Windows**
```bash
npm run dev
```

### **macOS / Linux**
```bash
npm run dev:linux
```

---

## 🛠️ Individual Commands (Optional)

If you need to run the services separately:

| Service | Windows | macOS / Linux |
| :--- | :--- | :--- |
| **Frontend** | `npm run dev-frontend` | `npm run dev-frontend:linux` |
| **Backend** | `npm run dev-backend` | `npm run dev-backend:linux` |

---

## 📂 Project Structure

- `frontend/`: React application, UI components, and Tone.js integration.
- `backend/`: FastAPI server handling MIDI conversion and AI requests.
- `Collection/`: Local storage for generated `.wav` and `.mid` files.
- `public/samples/`: Piano samples for the interactive audio engine.

---

## 🤝 Contributing
Contributions are welcome! If you'd like to improve Harmonic, please fork the repository and submit a pull request.

---

## ⚖️ License
This project is for educational and creative purposes. Created with 💙 for musicians.
