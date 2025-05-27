import React, { useState , useEffect} from 'react';
import * as Tone from 'tone';
// import { Midi } from '@tonejs/midi';
import { useContext } from "react";
import { SamplerContext } from "../AudioLoader";

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
 interface Note {
  name: string;
  midi: number;
  time: number;
  duration: number;
  velocity: number;
  ticks?: number;
  durationTicks?: number;
  channel?: number;
  noteOffVelocity?: number;
  hand?: "left" | "right";
  unplayable?: boolean;
  color?: string;
  root?: string;
}

const PianoRollApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]); // Store parsed MIDI notes
  // const [tempo, setTempo] = useState<number>(120);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const resultRes = await fetch("http://localhost:8000/result");
        const noteData = await resultRes.json();
        setNotes(noteData); // or setAnalyzedNotes if you're using global context
        drawPianoRoll(noteData);
      } catch (fetchErr) {
        console.error("Error fetching result:", fetchErr);
      }
    };

    fetchResult();
  }, []);
  
  const sampler = useContext(SamplerContext);

  // const handleMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]; // Get selected file
  //   if (!file) {
  //     console.error("No file selected.");
  //     return;
  //   }
  //   const reader = new FileReader();
  //   reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  //   reader.onload = (e) => {
  //     const midiData = e.target?.result as ArrayBuffer; // Get file data
  //     const midi = new Midi(midiData); // Parse MIDI

  //     const tempoEvents = midi.header.tempos;
  //     setTempo(tempoEvents.length > 0 ? tempoEvents[0].bpm : 120);

  //     const parsedNotes: Note[] = midi.tracks[0].notes.map(note => ({
  //       name: note.name || Tone.Frequency(note.midi, "midi").toNote(),
  //       midi: note.midi,
  //       time: note.time,
  //       duration: note.duration,
  //       velocity: note.velocity,
  //       ticks: note.ticks,
  //       durationTicks: note.durationTicks,
  //       // channel: note.channel,
  //       noteOffVelocity: note.noteOffVelocity,
  //     }));
  //     const grouped = groupNotesByStartTime(parsedNotes);
  //     const labeledNotes = assignHandsAndDetectSpan(grouped);
  //     // setNotes(labeledNotes); // Update state with notes
  //     // drawPianoRoll(labeledNotes); // Draw the piano roll
  //     setNotes(sampleNote); // Update state with notes
  //     drawPianoRoll(sampleNote); // Draw the piano roll
  //   };
  //   reader.onerror = () => {
  //     console.error("Error reading MIDI file.");
  //   };
  // };

  // // Allow some tolerance in time grouping
  // const groupNotesByStartTime = (notes: Note[], tolerance = 0.2): Note[][] => {
  //   const groups: Note[][] = [];

  //   notes.sort((a, b) => a.time - b.time);

  //   let currentGroup: Note[] = [];
  //   let currentTime = notes[0]?.time;

  //   for (let note of notes) {
  //     if (Math.abs(note.time - currentTime) <= tolerance) {
  //       currentGroup.push(note);
  //     } else {
  //       groups.push(currentGroup);
  //       currentGroup = [note];
  //       currentTime = note.time;
  //     }
  //   }

  //   if (currentGroup.length > 0) groups.push(currentGroup);

  //   return groups;
  // };

  // const assignHandsAndDetectSpan = (groups: Note[][]): Note[] => {
  //   const result: Note[] = [];

  //   // for (const group of groups) {
  //   groups.forEach((group, groupIndex) => {
  //     const pitches = group.map(n => n.midi).sort((a, b) => a - b);
  //     const min = pitches[0];
  //     const max = pitches[pitches.length - 1];
  //     const span = max - min;

  //     const isUnplayableSpan = span > 12; // more than 1 octave

  //     const labeledNotes: Note[] = group.map(note => {
  //       const isLeft = (pitches[pitches.length/2]> note.midi);
  //       return {
  //         ...note,
  //         hand: isLeft ? 'left' : 'right',
  //         unplayable: isUnplayableSpan && (note.midi === min || note.midi === max),
  //         // groupIndex,
  //       };
  //     });
  //     // const labeledNotes: Note[] = group.map(note => {
  //     //   const isLeft = note.midi < 60 || (span > 12 && note.midi === min);
  //     //   return {
  //     //     ...note,
  //     //     hand: isLeft ? 'left' : 'right',
  //     //     unplayable: isUnplayableSpan
  //     //     // groupIndex,
  //     //   };
  //     // });

  //     result.push(...labeledNotes);
  //   });
  //   return result;
  // };

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

    notes.forEach((note, i) => {
      Tone.Transport.schedule((time) => {
         if (sampler?.current) {
          sampler.current.triggerAttackRelease(note.name, note.duration, time+(i*0.02));
        }
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

    //   const colorPalette = [
    //   "#FF6347", "#3CB371", "#1E90FF", "#FFD700", "#DA70D6", "#20B2AA",
    //   "#FF69B4", "#CD5C5C", "#9ACD32", "#6495ED", "#FF8C00", "#8A2BE2"
    // ];

      notes.forEach((note) => {
        const y = (8-note.time) * canvas.height/7 + canvas.height/50; // Scale time position
        const x = (note.midi-20) * (1200/88); // Map MIDI pitch
        const height = -(note.duration * 50);

        // const isLeftHand = note.midi < 60;
        const isLeftHand = note.hand === "left";
        let width: number;

      //   const groupColor = colorPalette[note.groupIndex % colorPalette.length];
      // ctx.fillStyle = groupColor;
      // width = 12;
      //   ctx.fillRect(x, y, width, height);
        
        if (note.unplayable) {
          ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
          width = 2;
        } else if (note.name && note.name.includes("#")) {
          ctx.fillStyle = isLeftHand? "rgba(94, 0, 128, 0.8)" : "rgba(255, 69, 0, 0.8)";
          width = 8;
        } else {
          ctx.fillStyle = isLeftHand? "rgba(145, 0, 255, 0.7)": "rgba(255, 140, 0, 0.7)";
          width = 15;
        }
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = "rgb(0,0,0)";
        // ctx.fillText(note.name, x-10, y);
        // const midiNumber = note.midi - 20;
        // ctx.fillText(midiNumber.toString(), x+10, y);
        ctx.fillText(note.time.toFixed(2), x, y);
        ctx.fillText(note.root, x, y-20);

        // ctx.fillText(note.duration, x, y-20);
        // ctx.fillText(note.hand, x, y-10);
        // ctx.fillText(note.unplayable, x, y-20);
        
      });
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Piano Roll Playback</h1>
      {/* <input
        type="file"
        id="midiFile"
        accept=".mid"
        onChange={handleMidiFileChange}
      /> */}
      <button onClick={playMidi}>Play MIDI</button>
      <canvas id="pianoRoll" width={1225} height={600} style={{ backgroundColor: 'rgba(16, 67, 168, 0.52)' ,border: '1px solid blue', display: 'block', margin: '10px auto' }} />
    </div>
  );
};

export default PianoRollApp;
