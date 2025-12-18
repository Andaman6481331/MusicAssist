import * as Tone from "tone";  
import { useContext, useEffect, useRef, useState } from "react";
import { SamplerContext } from "../../App";

const chordMap: Record<string, number[]> = {
// I (C major tonic)
I: [0, 4, 7], // C major
I7: [0, 4, 7, 10], // C7
Imaj7: [0, 4, 7, 11], // Cmaj7
i: [0, 3, 7], // C minor
i7: [0, 3, 7, 10], // C minor 7

// II
II: [2, 6, 9], // D major
II7: [2, 6, 9, 12], // D7 (dominant)
IImaj7: [2, 6, 9, 13], // Dmaj7
ii: [2, 5, 9], // D minor
ii7: [2, 5, 9, 12], // Dm7

// III
III: [4, 8, 11], // E major
III7: [4, 8, 11, 14], // E7
IIImaj7: [4, 8, 11, 15], // Emaj7
iii: [4, 7, 11], // E minor
iii7: [4, 7, 11, 14], // Em7

// IV
IV: [5, 9, 12], // F major
IV7: [5, 9, 12, 15], // F7
IVmaj7: [5, 9, 12, 16], // Fmaj7
iv: [5, 8, 12], // F minor
iv7: [5, 8, 12, 15], // Fm7

// V
V: [7, 11, 14], // G major
V7: [7, 11, 14, 17], // G7
Vmaj7: [7, 11, 14, 18], // Gmaj7
v: [7, 10, 14], // G minor
v7: [7, 10, 14, 17], // Gm7

// VI
VI: [9, 13, 16], // A major
VI7: [9, 13, 16, 19], // A7
VImaj7: [9, 13, 16, 20], // Amaj7
vi: [9, 12, 16], // A minor
vi7: [9, 12, 16, 19], // Am7

// VII
VII: [11, 15, 18], // B major
VII7: [11, 15, 18, 21], // B7
VIImaj7: [11, 15, 18, 22], // Bmaj7
vii: [11, 14, 18], // B minor
vii7: [11, 14, 18, 21], // Bm7

VIIb:[10, 14, 17]
};

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const allKey = [
    "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
    "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
    "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
];



interface ProgressionDisplayProps {
  progType?: string;
}

interface ActiveNote {
  key: string;
  endTime: number;
}

const ProgressionDisplay: React.FC<ProgressionDisplayProps> = ({progType="I-IV-V"}) => {
    const sampler = useContext(SamplerContext);
    const playingRef = useRef<{ abort: boolean }>({ abort: false });

    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
    const [selectedScale, setSelectedScale] = useState<string>("");
    const [selectedPattern, setSelectedPattern] = useState<string>("Block Chord");

    //Define Visual Keys
    const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
    const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
    // const octaves = [3, 4, 5]; // You can adjust this range as needed
      const progression = [
        { name: "I-IV-V", sequence: ["I", "IV", "V"] },
        { name: "i-V-i", sequence: ["i", "V", "i"] },
        { name: "I-vi-IV-V", sequence: ["I", "vi", "IV", "V"] },
        { name: "ii-V-I", sequence: ["ii", "V", "I"] },
        { name: "Common Dorian", sequence: ["i", "IV"] },
        { name: "ModernPop Dorian", sequence: ["i", "VII", "IV"] },
        { name: "ClassRock Mixolydian", sequence: ["I", "VIIb", "IV"] },
        { name: "Flavor Mixolydian", sequence: ["I", "v", "IV"] },
        { name: "Simple Mixolydian", sequence: ["I", "VIIb"] },
    ];

    const octaves = Array.from({ length: 3 }, (_, i) => 3 + i);

    // Get full list of white/black keys with octave
    const allWhiteKeys = octaves.flatMap((octave) =>
        whiteKeys.map((note) => ({ note: note + octave, base: note, octave }))
    );

    const allBlackKeys = octaves.flatMap((octave) =>
        blackKeys.map((note) => ({ note: note + octave, base: note, octave }))
    );

    const togglePattern = () => {
        if (selectedPattern == "Block Chord"){
        setSelectedPattern("Arpreggio");
        }else if (selectedPattern == "Arpreggio"){
        setSelectedPattern("Pop Ballad");
        } else if (selectedPattern == "Pop Ballad"){
        setSelectedPattern("Block Chord");
        }
    } 
    //Compute the progression from chordmap to all key
    function getChordNotes(selectedScale: string, progression: string[]) {
        // find the first index of the selected scale in allKey
        const rootIndex = allKey.findIndex(
        (k) => k.startsWith(selectedScale) && k.endsWith("3")
        );
        if (rootIndex === -1) return [];

        const result: string[][] = [];

        progression.forEach((chordName) => {
            const intervals = chordMap[chordName];
            if (!intervals) return;
            const chordNotes = intervals.map((i) => allKey[rootIndex + i]);
            result.push(chordNotes);
        });

        return result;
    }

    function getArpreggioNotes(selectedScale: string, progression: string[], seqPattern: number[]) {
        const rootIndex = allKey.findIndex(
            (k) => k.startsWith(selectedScale) && k.endsWith("3")
        );
        if (rootIndex === -1) return [];

        const degreeToSemitone: Record<string, number> = {
            I: 0,
            i:0,
            II: 2,
            iii: 3,
            III: 4,
            IV: 5,
            V: 7,
            vi: 8,
            VI: 9,
            VIIb: 10,
            VII: 11,
        };

        const arpregPattern = seqPattern; // 1 → 5 → 8

        const result: string[] = [];

        progression.forEach((deg) => {
            const semitoneOffset = degreeToSemitone[deg];
            if (semitoneOffset === undefined) return;

            const chordRootIndex = rootIndex + semitoneOffset;

            const notes = arpregPattern
            .map((n) => allKey[chordRootIndex + n])
            .filter(Boolean);

            result.push(...notes);
        });

        return result; // flat array
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

    const playBlockProgression = async () => {
    if (!sampler?.samplerRef.current) return;
    const progSequence = progression.find((p) => p.name === progType)?.sequence ?? [];

    // Abort previous sequence
    if (!playingRef.current.abort) {
      playingRef.current.abort = true;
      await sleep(0, playingRef.current); // let previous sequence notice abort
    }

    // Compute chord notes for the clicked progression
    const chordNotes = getChordNotes(selectedScale, progSequence);

    // Reset abort flag for the new sequence
    playingRef.current = { abort: false };

    const chordDuration = 1000;
    const delayBetweenChords = 500;

    for (let i = 0; i < chordNotes.length; i++) {
      if (playingRef.current.abort) break;

      const chord = chordNotes[i];

      // Highlight notes
      setActiveNotes(
        chord.map((key) => ({ key, endTime: Date.now() + chordDuration }))
      );

      // Play all notes
      chord.forEach((note) => {
        sampler.samplerRef.current!.triggerAttackRelease(
          note,
          chordDuration / 1000 + "n"
        );
      });

      await new Promise((res) => setTimeout(res, chordDuration));
      setActiveNotes([]); // remove highlight
      await new Promise((res) => setTimeout(res, delayBetweenChords));
    }

    setActiveNotes([]);
  };

  const playArpregProgression = async(seq: number[]) => {
    if (!sampler?.samplerRef.current) return;
    const progSequence = progression.find((p) => p.name === progType)?.sequence ?? [];

    const arpregNotes = getArpreggioNotes(selectedScale,progSequence,seq);
    
    for (let i = 0; i < arpregNotes.length; i++) {
        const note = arpregNotes[i];
         setActiveNotes([
            {
            key: note,
            endTime: Date.now() + 300, // expires after 250ms
            },
        ]);
        if (sampler?.samplerRef.current) {
            sampler.samplerRef.current.triggerAttackRelease(note, "2n");
        }
        if(i%seq.length==(seq.length-1)){
            await new Promise((resolve) => setTimeout(resolve, 400));
        }else{
            await new Promise((resolve) => setTimeout(resolve, 300)); // wait 300ms before next note
        }
        setActiveNotes([]);
    }
  };

    useEffect(() => {
        if (!selectedScale) return;
        if (selectedPattern == "Block Chord"){
            playBlockProgression();
        }else  if(selectedPattern == "Arpreggio"){
            playArpregProgression([0, 7, 12]);
        }else  if(selectedPattern == "Pop Ballad"){
            playArpregProgression([0, 7, 4, 7, 4]);
        }
    }, [selectedScale]);

//[0, 7, 12] [0, 7, 4, 7, 4]
    return (
        <div>
            <div style={{display:"flex", justifyContent:"flex-end"}}>
                <button className="patternBtn" onClick={() => togglePattern()}>
                    Pattern : {selectedPattern}
                </button>
                </div>           
                <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                <div style={{display:"flex",width:"1000px", backgroundColor:"#16488D", borderRadius:"1rem", padding:"1rem", margin:"1rem 0"}}>
                    <div style={{fontSize:"5rem", fontWeight:"bold", width:"10rem", textAlign:"center"}}>
                    {!selectedScale? "C":selectedScale}
                    </div>
                {keys.map((Note, i) => (
                    <button className={`notebtn ${selectedScale === Note ? "selected" : ""}`} key={Note + i} onClick={() => {setSelectedScale(Note)}}>
                    {Note}
                    </button>
                ))}
                </div>
            </div>
        <div id="progressionPiano" style={{ marginLeft: "50%", height: "150px" }}>
            <div
            style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
            }}
            >
            {/* White keys */}
            <div style={{ display: "flex", zIndex: 0 }}>
                {allWhiteKeys.map(({ note }) => {
                const isSelected = activeNotes.some(
                    (n) => n.key === note && n.endTime > Tone.now()
                );
                const whiteKeyIndex = allWhiteKeys.findIndex(
                    (k) =>
                    k.note.startsWith(note.charAt(0)) &&
                    k.octave === parseInt(note.slice(-1))
                );
                const left = whiteKeyIndex * 50 - 50 * (21 / 2);
                return (
                    <div
                    key={note}
                    style={{
                        width: `${50}px`,
                        height: `${150}px`,
                        backgroundColor: isSelected ? "rgb(32, 173, 255)" : "white",
                        border: "1px solid black",
                        left: `${left}px`,
                        margin: "0",
                        position: "absolute",
                        boxSizing: "border-box",
                        borderRadius:
                        note === "C3"
                            ? "10px 0 0 10px"
                            : note === "B5"
                            ? "0 10px 10px 0"
                            : "0",
                    }}
                    ></div>
                );
                })}
            </div>
            {/* Black keys */}
            <div style={{ display: "flex", height: "90px", zIndex: 1 }}>
                {allBlackKeys.map(({ note }) => {
                const isSelected = activeNotes.some(
                    (n) => n.key === note && n.endTime > Tone.now()
                );
                // Calculate left offset based on white keys
                const whiteKeyIndex = allWhiteKeys.findIndex(
                    (k) =>
                    k.note.startsWith(note.charAt(0)) &&
                    k.octave === parseInt(note.slice(-1))
                );
                const left = whiteKeyIndex * 50 + 50 * 0.7 - (50 * 21) / 2; // 420 = half pianoroll size = make absolute position centered , 28 = margin btw white and black key
                return (
                    <div
                    key={note}
                    style={{
                        width: `${50 * 0.625}px`,
                        height: `${150 * 0.6}px`,
                        backgroundColor: isSelected
                        ? "rgba(22, 19, 169, 1)"
                        : "rgb(7, 5, 106)",
                        left: `${left}px`,
                        zIndex: 2,
                        position: "absolute",
                        borderRadius: "0 0 5px 5px",
                    }}
                    ></div>
                );
                })}
            </div>
            </div>
        </div>
        </div>
    );
};

export default ProgressionDisplay;
