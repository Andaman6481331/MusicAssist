import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { useContext } from "react";
import { SamplerContext } from "../App";

interface PianoVisualizerProps {
  isPlayable?: boolean;
  scaleLength?: number;
  startOctave?: number;
  height?: number;  //per key
  width?: number;
  showKeyname?: boolean;
  externalKey?: { key: string; duration: number }[];
  chordArrays?: string[][];
}
interface ActiveNote {
  key: string;
  endTime: number;
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({isPlayable = true, scaleLength=3, startOctave=3, height=150, width=40, showKeyname = true, externalKey= [],}) => {
  // const [selectedKey, setSelectedKey] = useState<string>("C");
  const sampler = useContext(SamplerContext);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
  const playingRef = useRef<{ abort: boolean }>({ abort: false });

  useEffect(() => {
    if (externalKey && externalKey.length > 0) {
      const now = Tone.now();
      const newNotes: ActiveNote[] = externalKey.map(({ key, duration }) => ({
        key,
        endTime: now + duration,
      }));

      setActiveNotes(prev =>
        [...prev, ...newNotes].filter(n => n.endTime > now)
      );

      const play = async () => {
        await Tone.start();
        if (sampler?.samplerRef.current) {
          externalKey.forEach(({ key }) => {
            sampler.samplerRef.current!.triggerAttackRelease(key, "1n");
          });
        }
      };

      play();
    }
  }, [externalKey]);

  //Progression = play sequences of chords [][]
  // useEffect(() => {
  //   if (!chordArrays || chordArrays.length === 0) return;

  //   // console.log(chordArrays);
  //   const playChordsSequentially = async (chordArrays: string[][]) => {
  //     await Tone.start();
  //     if (!sampler?.samplerRef.current || playingRef.current.abort) return;

  //     // Abort any previous sequence
  //     if (playingRef.current.abort === false) {
  //       playingRef.current.abort = true; // signal old sequence to stop
  //     }
  //     playingRef.current = { abort: false };

  //     const chordDuration = 1000; // ms
  //     const delayBetweenChords = 500; // ms

  //     for (let i = 0; i < chordArrays.length; i++) {
  //       if (playingRef.current.abort) break;
  //       const chord = chordArrays[i];

  //       // Highlight notes
  //       setActiveNotes(chord.map(key => ({ key, endTime: Date.now() + chordDuration })));

  //       // Play all notes in the chord
  //       chord.forEach(note => {
  //         sampler.samplerRef.current!.triggerAttackRelease(
  //           note,
  //           chordDuration / 1000 + "n"
  //         );
  //       });

  //       // Wait chord duration
  //       await new Promise(resolve => setTimeout(resolve, chordDuration));

  //       // Remove highlight
  //       setActiveNotes([]);

  //       // Wait delay before next chord
  //       await new Promise(resolve => setTimeout(resolve, delayBetweenChords));
  //     }

  //     // Clear highlights at the end
  //     setActiveNotes([]);
  //   };
  //   playChordsSequentially(chordArrays);

  // }, [chordArrays, sampler]);

  const handleKeyClick = async (key: string) => {
    // setSelectedKey([key]);samplerRef.
    setSelectedKey([key]);sampler?.samplerRef
    await Tone.start(); // Ensure the audio context is started before triggering sounds
    if (sampler?.samplerRef.current) {
        sampler.samplerRef.current.triggerAttackRelease(key, "1n");
    } else {
      console.error("Sampler not loaded yet");
    }
  };

  //Define Visual Keys
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  // const octaves = [3, 4, 5]; // You can adjust this range as needed

  const octaves = Array.from(
      {length: scaleLength},
      (_, i) => startOctave + i
    );

  // Get full list of white/black keys with octave
  const allWhiteKeys = octaves.flatMap(octave =>
    whiteKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

  const allBlackKeys = octaves.flatMap(octave =>
    blackKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        cursor: isPlayable ? "pointer" : "default"
      }}
    >
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {allWhiteKeys.map(({note}) => {
          // const isSelected = note === selectedKey;
          // const isSelected = selectedKey.includes(note);
          const isSelected = activeNotes.some(n => n.key === note && n.endTime > Tone.now()) || selectedKey.includes(note);
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = whiteKeyIndex * width - (width*((scaleLength*7)/2));
          return (
            <div
              key={note}
              onClick={() => isPlayable && handleKeyClick(note)}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: isSelected ? "rgb(32, 173, 255)" : "white",
                border: "1px solid black",
                left: `${left}px`,
                margin: "0",
                position: "absolute",
                boxSizing: "border-box",
                // borderRadius: (note==="C4")? "10px 0 0 10px": (note==="B5")? "0 10px 10px 0": "0"
              }}
            >
              {showKeyname &&
              (<div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "black",
                  userSelect: "none"
                }}>
                {note}
              </div>)}
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      {/* <div style={{ position: "absolute", display: "flex", left: "0", top: "0", height: "90px", zIndex: 1 }}> */}
      <div style={{display:"flex", height:"90px", zIndex: 1}}> 
        {allBlackKeys.map(({ note }) => {
          // const isSelected = note === selectedKey;
          // const isSelected = selectedKey.includes(note);
          const isSelected = activeNotes.some(n => n.key === note && n.endTime > Tone.now());

          // Calculate left offset based on white keys
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = (whiteKeyIndex*width) + (width*0.7) - (width*(scaleLength*7)/2); // 420 = half pianoroll size = make absolute position centered , 28 = margin btw white and black key
          return (
            <div
              key={note}
              onClick={() => isPlayable && handleKeyClick(note)}
              style={{
                width: `${width*0.625}px`,
                height: `${height*0.6}px`,
                backgroundColor: isSelected ? "rgb(32, 173, 255)" : "rgb(7, 5, 106)",
                left: `${left}px`,
                zIndex: 2,
                position: "absolute",
                borderRadius: "0 0 5px 5px"
              }}
            >
              {showKeyname && 
              (<div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "white",
                  userSelect: "none"
                }}>
                {note}
              </div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PianoVisualizer;
