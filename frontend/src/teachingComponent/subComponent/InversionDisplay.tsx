import { useState } from "react";
import PianoVisualizer from "../../component/PianoVisualizer";

type OctaveTriple = [number, number, number];

const MIN_OCT = 3;
const MID_OCT = 4;
const MAX_OCT = 5;

//chord C-F
const rootInvert: OctaveTriple   = [4, 4, 4]; // l l l
const firstInvert: OctaveTriple  = [5, 4, 4]; // h l l
const secondInvert: OctaveTriple = [5, 5, 4]; // h h l

//chord F#-G
const rootInvert2: OctaveTriple   = [3, 3, 4]; // l l l
const firstInvert2: OctaveTriple  = [4, 3, 4]; // h l l
const secondInvert2: OctaveTriple = [4, 4, 4]; // h h l

//chord G#-B
const rootInvert3: OctaveTriple   = [3, 4, 4]; // l l l
const firstInvert3: OctaveTriple  = [4, 4, 4]; // h l l
const secondInvert3: OctaveTriple = [4, 5, 4]; // h h l

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// const octaves = [3,4,5];
type Octave = 3 | 4 | 5;
// const allKeys = octaves.flatMap(octave =>
//     keys.map(note => ({ note: note + octave, base: note, octave }))
// );

const noteToPitch = (note: string, octave: number) =>
  octave * 12 + keys.indexOf(note);

const InversionDisplay: React.FC = () => {
    const [selectedChord,setChord] = useState("C");
    const [selectedInversion,setInversion] = useState<string[]>([]);
    const [currentOctaves, setCurrentOctaves] = useState<OctaveTriple>(rootInvert);


    const notesOnChord: Record<string,string[]> = {
        C: ["C", "E", "G"], // C major
        "C#": ["C#", "F", "G#"], // C# major
        D: ["D", "F#", "A"], // D major
        "D#": ["D#", "G", "A#"], // D# major
        E: ["E", "G#", "B"], // E major
        F: ["F", "A", "C"], // F major
        "F#": ["F#", "A#", "C#"], // F# major
        G: ["G", "B", "D"], // G major
        "G#": ["G#", "C", "D#"], // G# major
        A: ["A", "C#", "E"], // A major
        "A#": ["A#", "D", "F"], // A# major
        B: ["B", "D#", "F#"], // B major
    };

    const clamp = (val: number, min: number, max: number) =>
        Math.min(max, Math.max(min, val));


    const playInversion = (form?: string) => {
        const notes = notesOnChord[selectedChord] || [];
        if (notes.length !== 3) return [];

        let nextOctaves: OctaveTriple = [...currentOctaves];
         const keyIndex = keys.indexOf(selectedChord!);

        switch (form) {
            case "root":
                  nextOctaves = keyIndex >= 0 && keyIndex < 5
                    ? rootInvert
                    : nextOctaves = keyIndex >= 5 && keyIndex < 8
                    ? rootInvert2
                    : rootInvert3;
            break;

            case "first":
                  nextOctaves = keyIndex >= 0 && keyIndex < 5
                    ? firstInvert
                    : nextOctaves = keyIndex >= 5 && keyIndex < 8
                    ? firstInvert2
                    : firstInvert3;
            break;

            case "second":
                  nextOctaves = keyIndex >= 0 && keyIndex < 5
                    ? secondInvert
                    : nextOctaves = keyIndex >= 5 && keyIndex < 8
                    ? secondInvert2
                    : secondInvert3;
            break;

            case "inc": {
                // stop if already maxed
                if (currentOctaves.every(o => o === 5)) {
                    nextOctaves = currentOctaves;
                    break;
                }

                // find lowest pitch
                let lowestIdx = 0;
                let lowestPitch = noteToPitch(notes[0], currentOctaves[0]);

                for (let i = 1; i < notes.length; i++) {
                    const pitch = noteToPitch(notes[i], currentOctaves[i]);
                    if (pitch < lowestPitch) {
                    lowestPitch = pitch;
                    lowestIdx = i;
                    }
                }

                // move only the lowest note up
                nextOctaves = [...currentOctaves] as OctaveTriple;
                nextOctaves[lowestIdx] = Math.min(
                    (nextOctaves[lowestIdx] + 1) as Octave,
                    5
                );

                break;
                }

            case "dec": {
                // stop if already bottomed
                if (currentOctaves.every(o => o === 3)) {
                    nextOctaves = currentOctaves;
                    break;
                }

                // find highest pitch
                let highestIdx = 0;
                let highestPitch = noteToPitch(notes[0], currentOctaves[0]);

                for (let i = 1; i < notes.length; i++) {
                    const pitch = noteToPitch(notes[i], currentOctaves[i]);
                    if (pitch > highestPitch) {
                    highestPitch = pitch;
                    highestIdx = i;
                    }
                }

                // move only the highest note down
                nextOctaves = [...currentOctaves] as OctaveTriple;
                nextOctaves[highestIdx] = Math.max(
                    (nextOctaves[highestIdx] - 1) as Octave,
                    3
                );

                break;
                }

        }

        setCurrentOctaves(nextOctaves);
        // Combine note + octave → MIDI-style note names
        const finalNotes = notes.map((note, i) => `${note}${nextOctaves[i]}`);
        // console.log(finalNotes);

        setInversion(finalNotes);
    };


    return(
        <div>
            <div style={{display:"flex",justifyContent:"center", margin:"0.5rem 0"}}>
                <div style={{display:"flex", backgroundColor:"#4078C3"}}>
                    <div style={{fontSize:"3rem", fontWeight:"bold", width:"5rem", textAlign:"center"}}>
                        {!selectedChord? "C":selectedChord}
                        </div>
                    {keys.map((Note, i) => (
                        <button className={`notebtn ${selectedChord === Note ? "selectedChord" : ""}`} key={Note + i} onClick={() => {setChord(Note)}} style={{width:"2rem",height:"2rem", fontSize:"medium",margin:"auto 0.2rem"}}>
                        {Note}
                        </button>
                    ))}
                </div>
            </div>
            {/* <div style={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column"}}> */}
                <div className="inv-box">
                    <div className="inv-card" onClick={()=>playInversion("root")}>
                        <span className="inv-title">Root</span>
                        <div className="inv-seq">1-3-5</div>
                    </div>
                    <div className="inv-card" onClick={()=>playInversion("first")}>
                        <span className="inv-title">First</span>
                        <div className="inv-seq">3-5-1</div>
                    </div>
                    <div className="inv-card" onClick={()=>playInversion("second")}>
                        <span className="inv-title">Second</span>
                        <div className="inv-seq">5-1-3</div>
                    </div>
                </div>
            {/* </div> */}
            <div style={{display:"flex", alignItems:"center", position:"relative"}}>
                <img src="/icon/triangle.svg" alt="leftarrow" 
                    style={{transform:"scaleX(-1)", position:"absolute", left:"0", height:"3rem", cursor:"pointer"}}
                    onClick={()=>playInversion("dec")}/>
                <div style={{marginLeft:"50%", height:"150px"}}>
                    <PianoVisualizer
                        isPlayable={false}
                        startOctave={3}
                        scaleLength={3}
                        showKeyname={false}
                        chordArrays={selectedInversion}
                        />
                </div>
                <img src="/icon/triangle.svg" alt="rightarrow" 
                    style={{position:"absolute", right:"0", height:"3rem", cursor:"pointer"}}
                    onClick={()=>playInversion("inc")}
                    />
            </div>
        </div>
    );
};

export default InversionDisplay;