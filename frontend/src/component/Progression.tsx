import { useRef, useEffect, useState, useContext } from "react";
import PianoVisualizer from "./PianoVisualizer";
import * as Tone from "tone";
import { SamplerContext } from "../App";

interface ActiveNote {
  key: string;
  endTime: number;
}

const Progression: React.FC = () => {
    const sampler = useContext(SamplerContext);
    const [selectedProgression, setProgression] = useState<string[]>([]);
    const [selectedScale, setScale] = useState<string>("");
    const [chords, setChords] = useState<string[][]>([]);
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
    const playingRef = useRef<{ abort: boolean }>({ abort: false });

    const allKey = [
        "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
        "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
        "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"
    ];
    const chordMap: Record<string, number[]> = {
        // I (C major tonic)
        I:     [0, 4, 7],       // C major
        I7:    [0, 4, 7, 10],   // C7
        Imaj7: [0, 4, 7, 11],   // Cmaj7
        i:     [0, 3, 7],       // C minor
        i7:    [0, 3, 7, 10],   // C minor 7

        // II
        II:    [2, 6, 9],       // D major
        II7:   [2, 6, 9, 12],   // D7 (dominant)
        IImaj7:[2, 6, 9, 13],   // Dmaj7
        ii:    [2, 5, 9],       // D minor
        ii7:   [2, 5, 9, 12],   // Dm7

        // III
        III:    [4, 8, 11],      // E major
        III7:   [4, 8, 11, 14],  // E7
        IIImaj7:[4, 8, 11, 15],  // Emaj7
        iii:    [4, 7, 11],      // E minor
        iii7:   [4, 7, 11, 14],  // Em7

        // IV
        IV:     [5, 9, 12],      // F major
        IV7:    [5, 9, 12, 15],  // F7
        IVmaj7: [5, 9, 12, 16],  // Fmaj7
        iv:     [5, 8, 12],      // F minor
        iv7:    [5, 8, 12, 15],  // Fm7

        // V
        V:      [7, 11, 14],     // G major
        V7:     [7, 11, 14, 17], // G7
        Vmaj7:  [7, 11, 14, 18], // Gmaj7
        v:      [7, 10, 14],     // G minor
        v7:     [7, 10, 14, 17], // Gm7

        // VI
        VI:     [9, 13, 16],     // A major
        VI7:    [9, 13, 16, 19], // A7
        VImaj7: [9, 13, 16, 20], // Amaj7
        vi:     [9, 12, 16],     // A minor
        vi7:    [9, 12, 16, 19], // Am7

        // VII
        VII:     [11, 15, 18],     // B major
        VII7:    [11, 15, 18, 21], // B7
        VIImaj7: [11, 15, 18, 22], // Bmaj7
        vii:     [11, 14, 18],     // B minor
        vii7:    [11, 14, 18, 21], // Bm7
    };  
    
    const progressions = [
        {
            name: "Jazz Progression",
            sequence: ["ii7","V7","I7"],
            style: "Jazz",
        },
        {
            name: "Pop Progression",
            sequence: ["I","V","vi","IV"],
            style: "Classic",
        },
        {
            name: "Pop Progression2",
            sequence: ["I","VIIb","IV"],
            style: "Pop",
        },
        {
            name: "Pop Progression3",
            sequence: ["I","V","vi","iii","IV","I","IV","V"],
            style: "Pop",
        },
        {
            name: "Pop Progression4",
            sequence: ["IV","V","iii","vi"],
            style: "Pop",
        },
    ];

    //Compute the progression from chordmap to all key
    function getChordNotes(selectedScale: string, progression: string[]) {
        // find the first index of the selected scale in allKey
        const rootIndex = allKey.findIndex(k => k.startsWith(selectedScale) && k.endsWith("3"));
        if (rootIndex === -1) return [];

        const result: string[][] = [];

        progression.forEach(chordName => {
            const intervals = chordMap[chordName];
            if (!intervals) return;
            const chordNotes = intervals.map(i => allKey[rootIndex + i]);
            result.push(chordNotes);
        });

        return result;
    }

    const sleep = (ms: number, abortRef: { abort: boolean }) => {
  return new Promise<void>((resolve) => {
    const interval = 10; // check every 10ms
    let elapsed = 0;
    const id = setInterval(() => {
      if (abortRef.abort) {
        clearInterval(id);
        resolve();
        return;
      }
      elapsed += interval;
      if (elapsed >= ms) {
        clearInterval(id);
        resolve();
      }
    }, interval);
  });
};


    const handleProgressionClick = async (progSequence: string[]) => {
  if (!sampler?.samplerRef.current) return;

  // Abort previous sequence
  if (!playingRef.current.abort) {
    playingRef.current.abort = true;
    await sleep(0, playingRef.current); // let previous sequence notice abort
  }

  // Compute chord notes for the clicked progression
  const chordNotes = getChordNotes(selectedScale, progSequence);

  // Update visualizer
  setChords(chordNotes);

  // Reset abort flag for the new sequence
  playingRef.current = { abort: false };

  const chordDuration = 1000;
  const delayBetweenChords = 500;

  for (let i = 0; i < chordNotes.length; i++) {
    if (playingRef.current.abort) break;

    const chord = chordNotes[i];

    // Highlight notes
    setActiveNotes(chord.map(key => ({ key, endTime: Date.now() + chordDuration })));

    // Play all notes
    chord.forEach(note => {
      sampler.samplerRef.current!.triggerAttackRelease(note, chordDuration / 1000 + "n");
    });

    await new Promise(res => setTimeout(res, chordDuration));
    setActiveNotes([]); // remove highlight
    await new Promise(res => setTimeout(res, delayBetweenChords));
  }

  setActiveNotes([]);
};

    
    return(
        <div>
            <div className="card-container">
          <div className="card-title">Chord Progression</div>
          <div style={{display:"flex",flexDirection:"column",width:"80%", margin:"0 auto"}}>
            <div className="separater-around">
              <div style={{fontSize:"5rem", fontWeight:"700"}}>
              {selectedScale || "C"}
              </div>
              <div style={{display:"flex"}}>
                {["C","D","E","F","G","A","B"].map((Note) =>(
                  <button className="notebtn" onClick={() => setScale(Note)}>
                    {Note}
                  </button>
                ))}
              </div>
            </div>
            <div className="prog-layout">
              {progressions.map((prog, idx) => (
                <div className="prog-box" key={idx} onClick={()=>{
                    // setProgression(prog.sequence);
                    // setChords(getChordNotes(selectedScale, selectedProgression));
                    // playChordsSequentially(chords);
                    handleProgressionClick(prog.sequence)
                }}>
                  <h1>{progressions[idx].sequence.join("-")}</h1>
                  <div className="separater-around">
                    <div style={{ display: "flex" }}>
                      {/* {getChordNotes()} */}
                    </div>
                  </div>
                  <div
                    style={{
                      margin: "0.5rem",
                      padding: "0.2rem 1rem",
                      textAlign: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.09)",
                      borderRadius: "1rem",
                    }}>
                    {prog.style}
                  </div>
                </div>
              ))}
            </div>
            <div>
                <div id="progressionPiano" style={{marginLeft:"50%", height:"150px"}}>
                    <PianoVisualizer
                    isPlayable={false}
                    showKeyname={false}
                    // chordArrays={chords}
                    // activeNotes={activeNotes}
                    />
                </div>
            </div>
          </div>
        </div>
    </div>
        
    );
};

export default Progression;