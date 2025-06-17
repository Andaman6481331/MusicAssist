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
}

const PianoRollApp: React.FC<PianoRollAppProps> = ({onNotePlayed}) => {
  const sampler = useContext(SamplerContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tempo, setTempo] = useState<number>(120);
  const [totalTime, setTotalTime] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const scrollRef = useRef<SVGGElement>(null);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);



  const svgWidth = 1225;
  const svgHeight = 600;

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
  const pixelsPerSecond = svgHeight / 5; // five sec to play the whole Y screen

  useEffect(() => {
    // fetch('/JsonOutputs/Test1147(1)_basic_pitch.json')
    fetch('/JsonOutputs/river_flow_in_you.json')
      .then(response => response.json())
      .then(data => {
        if (data.notes && Array.isArray(data.notes)) {
          setNotes(data.notes);
          setTempo(data.tempo_bpm);
          setTotalTime(data.total_time);
        } else {
          console.error('Invalid JSON format:', data);
        }
      })
      .catch(error => console.error('Error loading JSON:', error));
  }, []);

  const playMidi = async () => {
    if (notes.length === 0 || !sampler) return;

    await Tone.start();
    setIsPlaying(true);

    const svg = scrollRef.current;
    if (!svg) return;

    const startTime = performance.now();
    const played = new Set<number>();
    const visualOffsetStart = -svgHeight / 5; // Start slightly above screen
    const maxOffset = total_svg_height*2;

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000; // seconds since play started
      // Compute how far we've scrolled downward
      const offset = visualOffsetStart + elapsed * pixelsPerSecond;

      // Scroll downward (no double negative)
      if (scrollRef.current) {
        scrollRef.current.setAttribute('transform', `translate(0, ${offset})`);
      }

      const notesThisFrame: { name: string; duration: number }[] = [];
      notes.forEach((note, i) => {
        if (played.has(i)) return;

        const noteBase = note.name.slice(0, -1);
        const octave = parseInt(note.name.slice(-1));
        const baseX = keyPositionMap[noteBase] || 0;
        const x = baseX + (octave - 1) * whiteKeyWidth * 7;

        const y = svgHeight - (note.time / totalTime) * total_svg_height;
        const height = note.duration * pixelsPerSecond;
        const yAdjusted = y - height; // top of note
        const visualYTop = yAdjusted + offset;
        const visualYBottom = y + offset;

        const threshold = 2; // Pixel precision

        // Trigger when note's **bottom** touches bottom of screen
        if (Math.abs(visualYBottom - svgHeight) <= threshold) {
          played.add(i);
           notesThisFrame.push({ name: note.name, duration: note.duration });
        }
      });
      if (notesThisFrame.length > 0 && onNotePlayed) {
        onNotePlayed(notesThisFrame); //pass the play note to pianovisulizer
      }

      if (offset <= maxOffset) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };
  requestAnimationFrame(animate);
};
  const pausedTimeRef = useRef(0); // Save animation elapsed when paused
  const togglePlayback = async () => {
    if (!sampler || notes.length === 0) return;

    if (!isPlaying) {
      await Tone.start();
      Tone.Transport.start("+0.1", pausedTimeRef.current / 1000);
      const svg = scrollRef.current;
      if (!svg) return;

      const startTime = performance.now() - pausedTimeRef.current;
      const played = new Set<number>();

      const animate = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        pausedTimeRef.current = now - startTime;

        const offset = elapsed * pixelsPerSecond;

        if (scrollRef.current) {
          scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
        }

        const notesThisFrame: { name: string; duration: number }[] = [];
        notes.forEach((note, i) => {
          if (played.has(i)) return;

          const y = (note.time / totalTime) * total_svg_height;
          const height = note.duration * pixelsPerSecond;
          const visualYBottom = y + offset;

          const threshold = 2;
          if (Math.abs(visualYBottom - svgHeight) <= threshold) {
            played.add(i);
            notesThisFrame.push({ name: note.name, duration: note.duration });
          }
        });

        if (notesThisFrame.length > 0 && onNotePlayed) {
          onNotePlayed(notesThisFrame);
        }

        if (offset <= total_svg_height * 2) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          pausedTimeRef.current = 0;
        }
      };
      animationRef.current = requestAnimationFrame(animate);
      setIsPlaying(true);
    } else {
      // Pause
      setIsPlaying(false);
      Tone.Transport.pause();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
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
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Piano Roll Playback</h1>
      <input type="file" accept=".mid" onChange={handleMidiFileChange} />
      <button onClick={togglePlayback} className='playbtn' style={{ marginBottom: '10px' }}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={playMidi} className='playbtn' style={{ marginBottom: '10px' }}>Play</button>
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
                    onClick={() => note.name && handleKeyClick([note.name])}
                  />
                  <text
                    x={x + whiteKeyWidth / 2}
                    y={yAdjusted + height / 2}
                    fill="white"
                    fontSize={12}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    pointerEvents="none"
                  >
                    {note.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default PianoRollApp;
