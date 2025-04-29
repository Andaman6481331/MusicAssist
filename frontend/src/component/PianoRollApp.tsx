import React, { useState,useEffect } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';


const sampleUrls: Record<string, string> = {
  C3: "/notesSample/C3.mp3",
  "C#3": "/notesSample/Cs3.mp3",
  D3: "/notesSample/D3.mp3",
  "D#3": "/notesSample/Ds3.mp3",
  E3: "/notesSample/E3.mp3",
  F3: "/notesSample/F3.mp3",
  "F#3": "/notesSample/Fs3.mp3",
  G3: "/notesSample/G3.mp3",
  "G#3": "/notesSample/Gs3.mp3",
  A3: "/notesSample/A3.mp3",
  "A#3": "/notesSample/As3.mp3",
  B3: "/notesSample/B3.mp3",
  C4: "/notesSample/C4.mp3",
  "C#4": "/notesSample/Cs4.mp3",
  D4: "/notesSample/D4.mp3",
  "D#4": "/notesSample/Ds4.mp3",
  E4: "/notesSample/E4.mp3",
  F4: "/notesSample/F4.mp3",
  "F#4": "/notesSample/Fs4.mp3",
  G4: "/notesSample/G4.mp3",
  "G#4": "/notesSample/Gs4.mp3",
  A4: "/notesSample/A4.mp3",
  "A#4": "/notesSample/As4.mp3",
  B4: "/notesSample/B4.mp3",
  C5: "/notesSample/C5.mp3",
  "C#5": "/notesSample/Cs5.mp3",
  D5: "/notesSample/D5.mp3",
  "D#5": "/notesSample/Ds5.mp3",
  E5: "/notesSample/E5.mp3",
  F5: "/notesSample/F5.mp3",
  "F#5": "/notesSample/Fs5.mp3",
  G5: "/notesSample/G5.mp3",
  "G#5": "/notesSample/Gs5.mp3",
  A5: "/notesSample/A5.mp3",
  "A#5": "/notesSample/As5.mp3",
  B5: "/notesSample/B5.mp3",
};

const PianoRollApp: React.FC = () => {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null); 
  const [notes, setNotes] = useState<any[]>([]); // Store parsed MIDI notes

  useEffect(() => {
    const s = new Tone.Sampler({
      urls: sampleUrls,
      onload: () => {
        console.log("Sampler loaded");
      },
      onerror: (error) => {
        console.error("Error loading sampler:", error);
      },
    }).toDestination();
    setSampler(s);

    return () => {
      s.dispose(); // Cleanup when component unmounts
    };
  }, []);

  const handleMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get selected file
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer

    reader.onload = (e) => {
      const midiData = e.target?.result as ArrayBuffer; // Get file data
      const midi = new Midi(midiData); // Parse MIDI
      const parsedNotes = midi.tracks[0].notes; // Extract notes
      setNotes(parsedNotes); // Update state with notes
      drawPianoRoll(parsedNotes); // Draw the piano roll
    };

    reader.onerror = () => {
      console.error("Error reading MIDI file.");
    };
  };

  // Function to play MIDI notes
  const playMidi = () => {
    if (notes.length === 0) {
      alert("Please upload a MIDI file first.");
      return;
    }

    if (!sampler) {
      alert("Sampler is still loading...");
      return;
    }
    
    Tone.Transport.stop();  // Stop previous playback
    Tone.Transport.cancel(); // Clear previous schedules
    Tone.Transport.bpm.value = 100; // Set tempo

    notes.forEach((note) => {
      Tone.Transport.schedule((time) => {
        sampler.triggerAttackRelease(note.name, note.duration, time);
      }, note.time);
    });

    Tone.Transport.start("+0.1");
  };

  // Function to draw a simple piano roll
  const drawPianoRoll = (notes: any[]) => {
    const canvas = document.getElementById("pianoRoll") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "blue";

      notes.forEach((note) => {
        const y = note.time * 50; // Scale time position
        const x = (88 - note.midi) * 4; // Map MIDI pitch
        const height = note.duration * 50;
        const width = 4;
        ctx.fillRect(x, y, width, height);
      });
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Piano Roll Playback</h1>
      <input
        type="file"
        id="midiFile"
        accept=".mid"
        onChange={handleMidiFileChange}
      />
      <button onClick={playMidi}>Play MIDI</button>
      <canvas id="pianoRoll" width={800} height={400} style={{ border: '1px solid black', display: 'block', margin: '10px auto' }} />
    </div>
  );
};

export default PianoRollApp;
