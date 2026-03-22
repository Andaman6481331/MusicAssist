# 🎹 Harmonic (MusicAssist)

Harmonic is an AI-powered music assistant designed to empower musicians through advanced music theory tools, interactive piano visualizations, and AI-driven music generation. Whether you're a student learning the ropes or a professional looking for inspiration, Harmonic provides a suite of tools to enhance your musical journey.

---

## 🚀 Key Features & Showcase

### 🌟 1. The Dashboard (Landing Page)
Set the tone instantly with a visually stunning, responsive landing page offering quick access to all of Harmonic's powerful features.
<img src="frontend/src/assets/display/landing.gif" alt="Landing Page" width="100%">

### 🔐 2. Secure Authentication
A smooth, secure login and sign-up flow, protecting your generated tracks and custom data.
<img src="frontend/src/assets/display/login.gif" alt="Login and Sign In" width="100%">

### 🤖 3. AI Music Generation
Create original, high-quality music simply from text prompts or choices, powered by seamless backend integration with Replicate's **MusicGen** API.
<img src="frontend/src/assets/display/generating.gif" alt="AI Music Generation" width="100%">

### 🎹 4. Interactive Piano Roll
An interactive, real-time piano roll that visualizes and plays back musical compositions utilizing **Tone.js** and React state management for fluid animations.
<img src="frontend/src/assets/display/pianoroll.gif" alt="Interactive Piano Roll" width="100%">

### 🎼 5. Audio Processing & Analysis (WAV/MP3 to MIDI/JSON)
Convert raw audio recordings directly into structured MIDI/JSON data for deep musical analysis. Showcasing complex backend audio processing capabilities via **FastAPI** and **BasicPitch**.
<img src="frontend/src/assets/display/tools.gif" alt="Audio Tools & Conversion" width="100%">

### 🎓 6. Music Theory Academy
Structured, interactive lessons designed to teach music theory effectively. From basic chords to advanced progressions, learn comprehensively through dynamic React UI components.
<p align="center">
  <img src="frontend/src/assets/display/lesson1.gif" alt="Music Theory Lesson 1" width="49%">
  <img src="frontend/src/assets/display/lesson2.gif" alt="Music Theory Lesson 2" width="49%">
</p>

### 🎨 7. Theme Customization & Music Vault (My List)
A customizable, vibrant global UI paired with a **Music Vault** allowing users to seamlessly select, remove, and search through their generated or uploaded files, retaining state globally via React Context.
<img src="frontend/src/assets/display/color_list.gif" alt="Theme customization and file management" width="100%">

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
