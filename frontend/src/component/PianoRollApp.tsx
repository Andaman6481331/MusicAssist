import React, { useState } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { useContext } from "react";
import { SamplerContext } from "../AudioLoader";

const PianoRollApp: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]); // Store parsed MIDI notes
  const [tempo, setTempo] = useState<number>(120);

  const sampler = useContext(SamplerContext);

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

      const tempoEvents = midi.header.tempos;
      setTempo(tempoEvents.length > 0 ? tempoEvents[0].bpm : 120);

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
    Tone.Transport.bpm.value = 80; // Set tempo

    notes.forEach((note) => {
      Tone.Transport.schedule((time) => {
         if (sampler?.current) {
          sampler.current.triggerAttackRelease(note.name, note.duration, time);
        }
      }, note.time);
    });

    Tone.Transport.start("+0.1");
  };


  /*
  name	string	Note name (e.g. "C4", "D#5")
  midi	number	MIDI note number (e.g. 60 for C4)
  time	number	Time (in seconds or Tone.js ticks) when the note starts
  duration	number	Duration (in seconds) of the note
  velocity	number	Velocity (volume), between 0 and 1
  ticks	number	Position in ticks (MIDI timing unit)
  durationTicks	number	Duration in ticks
  channel	number	MIDI channel (if set)
  noteOffVelocity	number	Velocity when the note was released (optional)

    note.midi = 21 to 108 = 88keys || middle C = 60
    note.name = C#, D, F, etc.
  */
  
  // Function to draw a simple piano roll
  const drawPianoRoll = (notes: any[]) => {
    const canvas = document.getElementById("pianoRoll") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      notes.forEach((note) => {
        const y = note.time * 75 + 20; // Scale time position
        const x = (note.midi-20) * (1200/88); // Map MIDI pitch
        const height = note.duration * 50;

        if (note.name.includes("#")) {
          ctx.fillStyle = "rgba(10, 69, 103, 0.81)";
          const width = 8;
          ctx.fillRect(x, y, width, height);
        } else {
          ctx.fillStyle = "rgba(0, 162, 255, 0.81)";
          const width = 15;
          ctx.fillRect(x, y, width, height);
        }
        
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillText(note.name, x-10, y);
        const midiNumber = note.midi - 20;
        ctx.fillText(midiNumber.toString(), x+10, y);
        ctx.fillText(note.duration, x, y-10);
        
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
      <canvas id="pianoRoll" width={1200} height={650} style={{ backgroundColor: 'rgba(16, 67, 168, 0.52)' ,border: '1px solid blue', display: 'block', margin: '10px auto' }} />
    </div>
  );
};

export default PianoRollApp;
