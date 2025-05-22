import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import ScalePiano from "./ScalePiano";


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

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const KeyOnScale: Record<string, string[]> = {
  C:   ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  "C#": ["C#4", "D#4", "F4", "F#4", "G#4", "A#4", "C5", "C#5"],
  D:   ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
  "D#": ["D#4", "F4", "G4", "G#4", "A#4", "C5", "D5", "D#5"],
  E:   ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
  F:   ["F4", "G4", "A4", "A#4", "C5", "D5", "E5", "F5"],
  "F#": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "F5", "F#5"],
  G:   ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  "G#": ["G#4", "A#4", "C5", "C#5", "D#5", "F5", "G5", "G#5"],
  A:   ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"],
  "A#": ["A#4", "C5", "D5", "D#5", "F5", "G5", "A5", "A#5"],
  B:   ["B4", "C#5", "D#5", "E5", "F#5", "G#5", "A#5", "B5"],
};

const ScaleVisualizer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [playingNotes, setPlayingNotes] = useState<Record<string, string | null>>({});
  const [selectedScale, setSelectedScale] = useState<string>("D");

  useEffect(() => {
    // Load the sampler and check for errors
    const s = new Tone.Sampler({
      urls: sampleUrls,
      onload: () => {console.log("Sampler loaded");},
      onerror: (error) => {console.error("Error loading sampler:", error);},
    }).toDestination();
    setSampler(s); // Ensure the sampler is loaded
  }, []);


// const handleClick = async (key: string) => {
//   await Tone.start();
//   const scaleKeys = KeyOnScale[key];
//   if (!sampler) return;

//   setSelectedScale(key); // set the current active scale

//   for (let note of scaleKeys) {
//     setPlayingNote(note); // (you should have a state for this)
//     sampler.triggerAttackRelease(note, "1n");
//     await new Promise((resolve) => setTimeout(resolve, 500));
//   }

//   setPlayingNote(null);
//   setSelectedScale(null); // Clear highlight after playback
// };

  const handleClick = async (key: string) => {
    await Tone.start();
    const scaleKeys = KeyOnScale[key];
    if (!sampler) {
      console.error("Sampler not loaded");
      return;
    }

    setSelectedScale(key);

    for (let i = 0; i < scaleKeys.length; i++) {
      const note = scaleKeys[i];
    //   setPlayingNotes(prev => ({ ...prev, [key]: note }));
      sampler.triggerAttackRelease(note, "1n");
      setSelectedKey(note);
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait 500ms before next note
    }
    // setSelectedScale(null); // Clear highlight after playback
    // setPlayingNotes(prev => ({ ...prev, [key]: null }));
  };

  return (
    <div>
      <div className="separater">
        <h1>Scale Visualizer</h1>
        <div>searchbox</div>
      </div>
      <h2>Major Scales</h2>
      {keys.map((key) => (
        <div className="scale-card" key={key} onClick={() => handleClick(key)}>
          <div className="content">
            <h2>{key} Major</h2>
            <div className="scale-card-piano">
              <ScalePiano
                scaleLength={2}
                width={30}
                height={130}
                highlightNotes={KeyOnScale[key]}
                playingNote={selectedKey}
                scale={selectedScale}
                // playingNote={playingNotes[key] ?? null}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScaleVisualizer;
