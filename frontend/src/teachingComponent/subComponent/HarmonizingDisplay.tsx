import { useRef, useState,useContext } from "react";
import * as Tone from "tone";
import { SamplerContext } from "../../App";

import PianoVisualizer from "../../component/PianoVisualizer";
import harmonizingMap from "../subComponent/HarmonizingMap.json";

export interface HarmonizingChord {
  chord: string;        // e.g. "C", "Am", "Em7"
  notes: string[];      // e.g. ["C", "E", "G"]
  type: string;         // e.g. "major", "minor", "dominant"
  feeling: string;      // e.g. "stable", "sad", "tense"
}

export type HarmonizingMapType = {
  [note: string]: HarmonizingChord[];
};

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const HarmonizingDisplay: React.FC = () => {
    const sampler = useContext(SamplerContext);

    const [melodyNote, setMelodyNote] = useState<string | null>(null);
    const [selectedChord, setSelectedChord] = useState<string | null>(null);
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    const [feeling, setFeeling] = useState<string>("Feeling");


    const [playingNote, setPlayingNote] = useState<string | null>(null);
    const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const HarmonizingMap = harmonizingMap as HarmonizingMapType;

    const playNote = (note: string) => {
    if (!sampler?.samplerRef.current) return;

    const noteWithOctave = /\d/.test(note) ? note : `${note}4`;

    sampler.samplerRef.current.triggerAttackRelease(
        noteWithOctave,
        "8n"
    );
    };

    const stopPlaying = () => {
    if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
    }
    setPlayingNote(null);
    };

    const holdPressKey = (Note: string) => {
        setMelodyNote(Note);
        setSelectedChord(Note);
        setFeeling("Feeling");

        // Case 1: clicking the same note → stop
        if (playingNote === Note) {
            stopPlaying();
            return;
        }
        // Case 2: clicking a different note → stop old, start new
        stopPlaying();
        // play immediately once
        playNote(Note);
        // loop every 0.5s
        playIntervalRef.current = setInterval(() => {
            playNote(Note);
        }, 550);

        setPlayingNote(Note);
    };


    return(
        <div>
            <div style={{display:"flex",justifyContent:"center", margin:"0.5rem 0"}}>
                <div style={{display:"flex", backgroundColor:"#4078C3"}}>
                    <div style={{fontSize:"3rem", fontWeight:"bold", width:"5rem", textAlign:"center"}}>
                        {!selectedChord? "C":selectedChord}
                        </div>
                    {keys.map((Note, i) => (
                        <button className={`notebtn ${selectedChord === Note ? "selectedChord" : ""}`} key={Note + i} style={{width:"2rem",height:"2rem", fontSize:"medium",margin:"auto 0.2rem"}}
                        onClick={() => {
                            holdPressKey(Note)
                        }} >
                        {Note}
                        </button>
                    ))}
                </div>
            </div>
                <div className="inv-box" style={{flexDirection:"column", width:"100%"}}>
                    <div>
                        <h2>{feeling}</h2>
                    </div>
                    <div style={{display:"flex",flexDirection:"row",gap:"0.5rem"}}>
                    {melodyNote &&
                        HarmonizingMap[melodyNote].map((item, idx) => (
                            <div
                            key={idx}
                            className="inv-card"
                            onClick={() => {
                                const notesWithOctave = item.notes.map(n => `${n}4`);
                                setSelectedNotes(notesWithOctave);
                                setFeeling(item.feeling);
                            }}
                            >
                            <span className="inv-title">{item.chord}</span>
                            <div className="inv-seq">{item.notes.join("-")}</div>
                            </div>
                        ))
                        }
                    </div>
                </div>
            <div style={{display:"flex", alignItems:"center", position:"relative"}}>
                <div style={{marginLeft:"50%", height:"150px"}}>
                    <PianoVisualizer
                        isPlayable={false}
                        startOctave={3}
                        scaleLength={3}
                        showKeyname={false}
                        chordArrays={selectedNotes}
                        />
                </div>
            </div>
        </div>
    );
};

export default HarmonizingDisplay;