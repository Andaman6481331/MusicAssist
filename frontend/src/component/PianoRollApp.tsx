import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import { saveJsonRecord } from "../data/jsonGenerations";
import { subscribeAuth } from "../auth";
import "./PianoRollApp.css";

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
  width?: number;
  height?: number;
  showNote?: boolean;
  fileName?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const PianoRollApp: React.FC<PianoRollAppProps> = ({
  width = 25,
  height = 100,
  showNote = true,
  fileName = "unrival",
}) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = subscribeAuth((u) => setUser(u));
    return () => unsub && unsub();
  }, []);

  const sampler = useContext(SamplerContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tempo, setTempo] = useState<number>(120);
  const [totalTime, setTotalTime] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);

  const scrollRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const playedKeysRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const [, forceUpdate] = useState(0);
  
  const triggerUpdate = () => forceUpdate((p) => (p + 1) % 10000);

  const svgWidth = 49 * width;
  const svgHeight = 6 * height;
  const totalWhiteKeys = 49;
  const whiteKeyWidth = svgWidth / totalWhiteKeys;

  const keyPositionMap: Record<string, number> = useMemo(() => ({
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
  }), [whiteKeyWidth]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/JsonOutputs/${fileName}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON");
        }

        if (user) {
          try {
            await saveJsonRecord(user.uid, fileName, fileName, {
              tempo_bpm: data.tempo_bpm,
              total_time: data.total_time,
              notes: data.notes,
            });
          } catch (err: any) {
            console.error("Error saving JSON record:", err);
          }
        }

        if (data.notes) {
          setNotes(data.notes);
          setTempo(data.tempo_bpm);
          setTotalTime(data.total_time);
        }
      } catch (err) {
        console.error("Error loading JSON:", err);
      }
    };
    load();
  }, [fileName, user]);

  const pixelsPerBeat = svgHeight / 8;
  const pixelsPerSecond = (tempo / 60) * pixelsPerBeat;
  const total_svg_height = totalTime * pixelsPerSecond;

  const animate = (now: number) => {
    const visualOffsetStart = -svgHeight / 5;
    if (!startTimeRef.current) return;

    const elapsed = (now - startTimeRef.current) / 1000;
    const offset = visualOffsetStart + elapsed * pixelsPerSecond;
    setPausedTime(Math.min(elapsed, totalTime) * 1000);

    if (scrollRef.current) {
      scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
    }

    const keysToAdd: string[] = [];
    const threshold = 5; // Slightly increased for smoother triggering

    notes.forEach((note) => {
      const y = svgHeight - (note.time / totalTime) * total_svg_height;
      const visualYBottom = y + offset;

      if (Math.abs(visualYBottom - svgHeight) <= threshold && !playedKeysRef.current.has(note.name)) {
        const normalized = note.name;
        keysToAdd.push(normalized);

        if (sampler?.samplerRef.current) {
          sampler.samplerRef.current.triggerAttackRelease(
            normalized,
            note.duration,
            undefined,
            note.velocity
          );
        }

        setTimeout(() => {
          playedKeysRef.current.delete(normalized);
          triggerUpdate();
        }, note.duration * 1000);
      }
    });

    if (keysToAdd.length > 0) {
      keysToAdd.forEach((k) => playedKeysRef.current.add(k));
      triggerUpdate();
    }

    const paddingTime = (svgHeight / 5) / pixelsPerSecond;
    if (elapsed < totalTime + paddingTime + 1) { // Added +1s extra safety
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      setPausedTime(totalTime * 1000);
    }
  };

  const playMidi = async () => {
    if (notes.length === 0 || !sampler) return;
    await Tone.start();
    setIsPlaying(true);
    startTimeRef.current = performance.now() - pausedTime;
    animationRef.current = requestAnimationFrame(animate);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const restartMidi = () => {
    startTimeRef.current = performance.now();
    setPausedTime(0);
    playedKeysRef.current.clear();
    if (scrollRef.current) {
      const visualOffsetStart = -svgHeight / 5;
      scrollRef.current.setAttribute("transform", `translate(0, ${visualOffsetStart})`);
    }
    if (isPlaying) {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame((now) => {
        startTimeRef.current = performance.now();
        animate(now);
      });
    } else {
      triggerUpdate();
    }
  };

  const seek = (timeMs: number) => {
    const clampedTime = Math.max(0, Math.min(timeMs, totalTime * 1000));
    setPausedTime(clampedTime);
    startTimeRef.current = performance.now() - clampedTime;
    if (scrollRef.current) {
      const offset = -svgHeight / 5 + (clampedTime / 1000) * pixelsPerSecond;
      scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
    }
    triggerUpdate();
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const updateSeek = (clientX: number) => {
      const clickX = clientX - rect.left;
      const newTime = (clickX / rect.width) * totalTime * 1000;
      seek(newTime);
    };
    
    updateSeek(e.clientX);
    isDraggingRef.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) updateSeek(moveEvent.clientX);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const octaves = [1, 2, 3, 4, 5, 6, 7];
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  const allWhiteKeys = octaves.flatMap((octave) =>
    whiteKeys.map((note) => ({ note: note + octave, base: note, octave }))
  );

  const allBlackKeys = octaves.flatMap((octave) =>
    blackKeys.map((note) => ({ note: note + octave, base: note, octave }))
  );

  return (
    <div className="pianoroll-app-container">
      {/* Visual Area */}
      <div className="svg-container" style={{ width: svgWidth, height: svgHeight }}>
        <svg width={svgWidth} height={svgHeight}>
          <defs>
            <linearGradient id="noteGradientLH" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-secondary)" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="noteGradientRH" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <g ref={scrollRef} transform={`translate(0, -${svgHeight})`}>
            {notes.map((note, index) => {
              const noteBase = note.name.replace(/[0-9]/g, '');
              const octaveStr = note.name.replace(/[^0-9]/g, '');
              const octave = parseInt(octaveStr);
              const baseX = keyPositionMap[noteBase] || 0;
              const x = baseX + (octave - 1) * whiteKeyWidth * 7;
              const y = svgHeight - (note.time / totalTime) * total_svg_height;
              const heightPx = note.duration * pixelsPerSecond;
              const yAdjusted = y - heightPx;
              const isLH = note.hand?.includes("LH");

              return (
                <g key={index} className="note-group">
                  <rect
                    className="note-rect"
                    x={x}
                    y={yAdjusted}
                    width={note.name.includes("#") ? whiteKeyWidth * 0.7 : whiteKeyWidth}
                    height={heightPx}
                    rx={4}
                    fill={isLH ? "url(#noteGradientLH)" : "url(#noteGradientRH)"}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                  />
                  {showNote && heightPx > 20 && (
                    <text
                      className="note-text"
                      x={x + (note.name.includes("#") ? whiteKeyWidth * 0.35 : whiteKeyWidth / 2)}
                      y={yAdjusted + heightPx / 2}
                      fill="white"
                      fontSize={10}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {note.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Piano Keys */}
      <div className="piano-keys-wrapper">
        <div className="piano-keys-container" style={{ width: svgWidth }}>
          {allWhiteKeys.map(({ note }, idx) => {
            const isActive = playedKeysRef.current.has(note);
            return (
              <div
                key={note}
                className={`white-key ${isActive ? 'active' : ''}`}
                style={{ 
                  width: whiteKeyWidth, 
                  height: height, 
                  left: idx * whiteKeyWidth 
                }}
              >
                {showNote && <div className="white-key-text">{note}</div>}
              </div>
            );
          })}
          {allBlackKeys.map(({ note, base, octave }) => {
            const isActive = playedKeysRef.current.has(note);
            const whiteIdx = whiteKeys.indexOf(base.charAt(0));
            const x = (whiteIdx + (octave - 1) * 7) * whiteKeyWidth + (whiteKeyWidth * 0.65);
            return (
              <div
                key={note}
                className={`black-key ${isActive ? 'active' : ''}`}
                style={{ 
                  width: whiteKeyWidth * 0.7, 
                  height: height * 0.6, 
                  left: x 
                }}
              >
                {showNote && <div className="black-key-text">{note}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="pianoroll-controls">
        <div className="playback-info">
          <div className="time-display">
            <span className="time-current">{formatTime(pausedTime / 1000)}</span>
            <span className="time-total">/ {formatTime(totalTime)}</span>
          </div>
          <div className="tempo-display">{tempo} BPM</div>
        </div>

        <div className="seek-bar-container" onMouseDown={handleSeekClick}>
          <div 
            className="seek-progress" 
            style={{ 
              width: `${totalTime > 0 ? Math.min(100, Math.max(0, (pausedTime / (totalTime * 1000)) * 100)) : 0}%` 
            }} 
          />
        </div>

        <div className="button-group">
          <button className="control-btn" onClick={() => seek(pausedTime - 5000)} title="Back 5s">
            <img src="/icon/backwards.svg" alt="Back" />
          </button>
          
          <button className="control-btn" onClick={restartMidi} title="Restart">
            <img src="/icon/reload.svg" alt="Reload" />
          </button>

          <button className="control-btn play-btn" onClick={isPlaying ? pausePlayback : playMidi}>
            <img src={isPlaying ? "/icon/pause.svg" : "/icon/play.svg"} alt={isPlaying ? "Pause" : "Play"} />
          </button>

          <button className="control-btn" onClick={() => seek(pausedTime + 5000)} title="Forward 5s">
            <img src="/icon/forwards.svg" alt="Forward" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PianoRollApp;

