import React, { useState, useEffect, useRef, useContext } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { SamplerContext } from "../AudioLoader";

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
interface PianoRollAppProps {
  onNotePlayed?: (notes: { name: string; duration: number }[]) => void;
  width?: number;
  height?: number;
  showNote?: boolean;
  fileName?: String;
}

const PianoRollApp: React.FC<PianoRollAppProps> = ({onNotePlayed, width=25, height=100, showNote=true, fileName="unrival"}) => {
  const sampler = useContext(SamplerContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tempo, setTempo] = useState<number>(120);
  const [totalTime, setTotalTime] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const scrollRef = useRef<SVGGElement>(null);
  // const [currentNote, setCurrentNote] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  // const [selectedKey, setSelectedKey] = useState<string[]>([]);
  // const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
  const playedKeysRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0); // dummy state to trigger re-render
  const triggerUpdate = () => forceUpdate(prev => (prev + 1) % 10000);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);


  const svgWidth = 49*width;
  const svgHeight = 6*height;
  // const svgWidth = 1225;
  // const svgHeight = 600;

  const totalWhiteKeys = 49;
  const whiteKeyWidth = svgWidth / totalWhiteKeys;
  const keyPositionMap: Record<string, number> = {
    "C": whiteKeyWidth * 0,
    "C#": whiteKeyWidth * 0 + whiteKeyWidth * 0.7,
    "D": whiteKeyWidth * 1,
    "D#": whiteKeyWidth * 1 + whiteKeyWidth * 0.7,
    "E": whiteKeyWidth * 2,
    "F": whiteKeyWidth * 3,
    "F#": whiteKeyWidth * 3 + whiteKeyWidth * 0.7,
    "G": whiteKeyWidth * 4,
    "G#": whiteKeyWidth * 4 + whiteKeyWidth * 0.7,
    "A": whiteKeyWidth * 5,
    "A#": whiteKeyWidth * 5 + whiteKeyWidth * 0.7,
    "B": whiteKeyWidth * 6,
  };

  // useEffect(() => {
  //   fetch('/JsonOutputs/river_flow_in_you.json')
  //     .then(response => response.json())
  //     .then((data: Note[]) => setNotes(data))
  //     .catch(error => console.error('Error loading notes:', error));
  // }, []);

  

  useEffect(() => {
    fetch(`/JsonOutputs/${fileName}.json`)
      .then(response => {
        console.log("Fetching JSON:", `/JsonOutputs/${fileName}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.notes && Array.isArray(data.notes)) {
          const tempoFactor = 120 / data.tempo_bpm;  // 120 is your "reference" tempo
          const scaledNotes = data.notes.map((n: Note) => ({
            ...n,
            time: n.time * tempoFactor,
            duration: n.duration * tempoFactor
          }));
          setNotes(scaledNotes);
          setTempo(data.tempo_bpm);
          setTotalTime(data.total_time * tempoFactor);
        } else {
          console.error('Invalid JSON format:', data);
        }
      })
      .catch(error => console.error('Error loading JSON:', error));
  }, [fileName]);
  const pixelsPerBeat = svgHeight / 8; // adjust how much 1 beat moves visually
  const pixelsPerSecond = (tempo / 60) * pixelsPerBeat;
  // useEffect(() => {
  //   if (externalKey && externalKey.length > 0) {
  //     const now = Tone.now();
  //     const newNotes: ActiveNote[] = externalKey.map(({ key, duration }) => ({
  //       key,
  //       endTime: now + duration,
  //     }));
  
  //     setActiveNotes(prev =>
  //       [...prev, ...newNotes].filter(n => n.endTime > now)
  //     );
  
  //     const play = async () => {
  //       await Tone.start();
  //       if (sampler?.current) {
  //         externalKey.forEach(({ key }) => {
  //           sampler.current!.triggerAttackRelease(key, "1n");
  //         });
  //       }
  //     };
  
  //     play();
  //   }
  // }, [externalKey]);

  const playMidi = async () => {
    if (notes.length === 0 || !sampler) return;

    await Tone.start();
    setIsPlaying(true);

    const svg = scrollRef.current;
    if (!svg) return;

    const played = new Set<number>();
    const visualOffsetStart = -svgHeight / 5; // Start slightly above screen
    const maxOffset = total_svg_height*2;
    startTimeRef.current = performance.now() - pausedTime;
            
    
    const animate = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = (now - startTimeRef.current) / 1000;
      const offset = visualOffsetStart + elapsed * pixelsPerSecond;
      setPausedTime(now - startTimeRef.current);
      // Scroll downward
      if (scrollRef.current) {
        scrollRef.current.setAttribute('transform', `translate(0, ${offset})`);
      }
      
      const keysToAdd: string[] = [];
      const threshold = 2; // Pixel precision
      notes.forEach((note, i) => {
        if (played.has(i)) return;
        // const noteBase = note.name.slice(0, -1);
        // const octave = parseInt(note.name.slice(-1));
        // const baseX = keyPositionMap[noteBase] || 0;
        const y = svgHeight - (note.time / totalTime) * total_svg_height;
        const visualYBottom = y + offset;
        // Trigger when note's **bottom** touches bottom of screen
        if (!played.has(i) && Math.abs(visualYBottom - svgHeight) <= threshold) {
          played.add(i);

          const normalized = Tone.Frequency(note.midi, "midi").toNote();
          keysToAdd.push(normalized);
          triggerUpdate();
          if (sampler?.current) {
            sampler.current.triggerAttackRelease(normalized, note.duration, undefined, note.velocity);
          }
          setTimeout(() => {
            playedKeysRef.current.delete(normalized);
            triggerUpdate();
          }, note.duration * 1000);
        }
      });
      if (keysToAdd.length > 0) {
        keysToAdd.forEach(k => playedKeysRef.current.add(k));
        triggerUpdate();
      }
      // if (offset <= maxOffset) {
      if (elapsed < totalTime) {
        // requestAnimationFrame(animate);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setPausedTime(0);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  // requestAnimationFrame(animate);
};
const pausePlayback = () => {
  setIsPlaying(false);
  if (animationRef.current !== null) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }
};

  const handleMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      const midiData = e.target?.result as ArrayBuffer;
      const midi = new Midi(midiData);

      // const tempoEvents = midi.header.tempos;
      // setTempo(tempoEvents.length > 0 ? tempoEvents[0].bpm : 120);

      const parsedNotes: Note[] = midi.tracks[0].notes.map(note => ({
        name: note.name || Tone.Frequency(note.midi, "midi").toNote(),
        midi: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
        ticks: note.ticks,
        durationTicks: note.durationTicks,
        noteOffVelocity: note.noteOffVelocity,
      }));

      setNotes(parsedNotes);
    };
  };

  const handleKeyClick = async (key: string[]) => {
    await Tone.start();
    if (sampler?.current) {
      sampler.current.triggerAttackRelease(key, "1n");
    }
  };

  const total_svg_height = totalTime * pixelsPerSecond;

   const octaves = Array.from(
      {length: 7},
      (_, i) => 1 + i
    );
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  const allWhiteKeys = octaves.flatMap(octave =>
    whiteKeys.map(note => ({ note: note + octave, base: note, octave }))
  );
  const allBlackKeys = octaves.flatMap(octave =>
    blackKeys.map(note => ({ note: note + octave, base: note, octave }))
  );


  return (
    <div style={{ textAlign: 'center', maxHeight:`${svgHeight}` }}>
      {/* <h1>Piano Roll Playback</h1>
      <input type="file" accept=".mid" onChange={handleMidiFileChange} /> */}
      {/* <button onClick={playMidi} className='playbtn' style={{ marginBottom: '10px' }}>Play</button> */}
      <div className="PianoRoll-Bg" style={{ width: svgWidth, height: svgHeight, overflow: 'hidden', border: '2px solid black' }}>
        <svg width={svgWidth} height={svgHeight} xmlns="http://www.w3.org/2000/svg">
          <g ref={scrollRef} transform={`translate(0, -${svgHeight})`}>
            {notes.map((note, index) => {
              const noteBase = note.name.slice(0, -1);
              const octave = parseInt(note.name.slice(-1));
              const baseX = keyPositionMap[noteBase] || 0;
              const x = baseX + (octave - 1) * whiteKeyWidth * 7;
              const y = svgHeight - (note.time / totalTime) * total_svg_height;
              const height = note.duration * pixelsPerSecond;
              const yAdjusted = y - height;

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={yAdjusted}
                    width={note.name.includes("#") ? whiteKeyWidth * 0.6 : whiteKeyWidth}
                    height={height}
                    rx={4}
                    ry={4}
                    fill={note.name.includes("#") ? "rgba(8, 117, 201, 0.72)" : "rgba(32, 173, 255, 0.72)"}
                    stroke="#222"
                    strokeWidth={1}
                    cursor="pointer"
                    // onClick={() => note.name && handleKeyClick([note.name])}
                    onClick={() => index && handleKeyClick([note.name])}
                  />
                  {(showNote && <text
                    x={x + whiteKeyWidth / 2}
                    y={yAdjusted + height / 2}
                    fill="white"
                    fontSize={12}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    pointerEvents="none"
                  >
                    {note.name}
                  </text>)}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {/* drawingpiano at bottom */}
      <div style={{marginLeft:`${(svgWidth/2)+2}px`}}>
        <div style={{ position: "relative"}}>
          <div style={{ display: "flex", zIndex: 0 }}>
              {allWhiteKeys.map(({note}) => {
                // const width = 25;
                // const height = 100;
                const isSelected = playedKeysRef.current.has(note);
                const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
                const left = whiteKeyIndex * width - (width*((7*7)/2));
                return (
                  <div
                    key={note}
                    style={{
                      width: `${width}px`,
                      height: `${height}px`,
                      backgroundColor: isSelected ? "rgb(32, 173, 255)" : "white",
                      border: "1px solid black",
                      left: `${left}px`,
                      margin: "0",
                      position: "absolute",
                      boxSizing: "border-box",
                    }}
                  >
                    {(showNote && <div
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
            <div style={{display:"flex", height:`${height}px`,zIndex: 1}}> 
              {allBlackKeys.map(({ note }) => {
                // const width = 25;
                // const height = 100;
                const isSelected = playedKeysRef.current.has(note);
                const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
                const left = (whiteKeyIndex*width) + (width*0.7) - (width*(7*7)/2); // 420 = half pianoroll size = make absolute position centered , 28 = margin btw white and black key
                return (
                  <div
                    key={note}
                    style={{
                      width: `${width*0.625}px`,
                      height: `${height*0.6}px`,
                      backgroundColor: isSelected ? "rgb(8, 117, 201)" : "black",
                      left: `${left}px`,
                      zIndex: 2,
                      position: "absolute",
                    }}
                  >
                    {(showNote && <div
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
      </div>
      <button 
        onClick={() => {isPlaying ? pausePlayback() : playMidi();}} 
        className='playbtn'
        style={{ margin: '0.5rem 0', width:"100%"}}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default PianoRollApp;
