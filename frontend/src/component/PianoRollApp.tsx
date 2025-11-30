import React, { useState, useEffect, useRef, useContext } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { SamplerContext } from "../App";
import { saveJsonRecord } from "../data/jsonGenerations";
import { subscribeAuth } from "../auth";

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
  fileName?: string;
}

const PianoRollApp: React.FC<PianoRollAppProps> = ({
  onNotePlayed,
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
  const whiteCount = 49;
  const whiteWidth = svgWidth / whiteCount;

  const keyPositionMap: Record<string, number> = {
    C: whiteWidth * 0,
    "C#": whiteWidth * 0 + whiteWidth * 0.7,
    D: whiteWidth * 1,
    "D#": whiteWidth * 1 + whiteWidth * 0.7,
    E: whiteWidth * 2,
    F: whiteWidth * 3,
    "F#": whiteWidth * 3 + whiteWidth * 0.7,
    G: whiteWidth * 4,
    "G#": whiteWidth * 4 + whiteWidth * 0.7,
    A: whiteWidth * 5,
    "A#": whiteWidth * 5 + whiteWidth * 0.7,
    B: whiteWidth * 6,
  };

  // ------------------------------------------------------------
  // LOAD JSON + SAVE JSON TO FIRESTORE
  // ------------------------------------------------------------
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
          console.error("Invalid JSON:", text.slice(0, 200));
          throw new Error("Invalid JSON");
        }

        // Save JSON to Firestore
        if (user) {
          const generationId = fileName;
          const displayName = fileName;

          try {
            await saveJsonRecord(user.uid, generationId, displayName, {
              tempo_bpm: data.tempo_bpm,
              total_time: data.total_time,
              notes: data.notes,
            });
            console.log("🔥 Saved JSON for:", fileName);
          } catch (err: any) {
            if (err.message === "FILENAME_ALREADY_EXISTS") {
              console.warn("⚠ Name duplicated — skipping save");
            } else {
              console.error("Error saving:", err);
            }
          }
        }

        // Apply JSON to Piano Roll
        if (data.notes) {
          const factor = 120 / data.tempo_bpm;
          const scaled = data.notes.map((n: Note) => ({
            ...n,
            time: n.time * factor,
            duration: n.duration * factor,
          }));

          setNotes(scaled);
          setTempo(data.tempo_bpm);
          setTotalTime(data.total_time * factor);
        }
      } catch (err) {
        console.error("Error loading JSON:", err);
      }
    };

    load();
  }, [fileName, user]);

  // playback & UI
  const pixelsPerBeat = svgHeight / 8;
  const pixelsPerSecond = (tempo / 60) * pixelsPerBeat;
  const total_svg_height = totalTime * pixelsPerSecond;

  const animate = (now: number) => {
    const played = new Set<number>();
    const visualOffsetStart = -svgHeight / 5;
    const maxOffset = total_svg_height * 2;

    if (!startTimeRef.current) return;

    const elapsed = (now - startTimeRef.current) / 1000;
    const offset = visualOffsetStart + elapsed * pixelsPerSecond;

    const newPausedTime = now - startTimeRef.current;
    setPausedTime(newPausedTime);

    if (scrollRef.current) {
      scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
    }

    const keysToAdd: string[] = [];
    const threshold = 2;

    notes.forEach((note, i) => {
      if (played.has(i)) return;

      const y = svgHeight - (note.time / totalTime) * total_svg_height;
      const visualYBottom = y + offset;

      if (!played.has(i) && Math.abs(visualYBottom - svgHeight) <= threshold) {
        played.add(i);

        const normalized = Tone.Frequency(note.midi, "midi").toNote();
        keysToAdd.push(normalized);
        triggerUpdate();

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

    if (elapsed < totalTime + 2) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      setPausedTime(0);
      console.log("playing done");
    }
  };

  // Play & Pause
  const playMidi = async () => {
    if (notes.length === 0 || !sampler) return;

    await Tone.start();
    setIsPlaying(true);

    if (!scrollRef.current) return;

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
      scrollRef.current.setAttribute(
        "transform",
        `translate(0, ${visualOffsetStart})`
      );
    }

    if (isPlaying) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame((now) => {
        startTimeRef.current = performance.now();
        animate(now);
      });
    }
  };

  const seekForward = (seconds = 5) => {
    setPausedTime((prev) => {
      const newTime = Math.min(prev + seconds * 1000, totalTime * 1000);
      startTimeRef.current = performance.now() - newTime;

      if (scrollRef.current) {
        const offset =
          -svgHeight / 5 + (newTime / 1000) * pixelsPerSecond;
        scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
      }

      return newTime;
    });
  };

  const seekBackward = (seconds = 5) => {
    setPausedTime((prev) => {
      const newTime = Math.max(prev - seconds * 1000, 0);
      startTimeRef.current = performance.now() - newTime;

      if (scrollRef.current) {
        const offset =
          -svgHeight / 5 + (newTime / 1000) * pixelsPerSecond;
        scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
      }

      return newTime;
    });
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    const newTime = (clickX / rect.width) * totalTime * 1000;
    setPausedTime(newTime);
    startTimeRef.current = performance.now() - newTime;

    if (scrollRef.current) {
      const offset =
        -svgHeight / 5 + (newTime / 1000) * pixelsPerSecond;
      scrollRef.current.setAttribute("transform", `translate(0, ${offset})`);
    }

    isDraggingRef.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dragX = moveEvent.clientX - rect.left;
      const clampedX = Math.max(0, Math.min(dragX, rect.width));
      const newTime = (clampedX / rect.width) * totalTime * 1000;

      setPausedTime(newTime);
      startTimeRef.current = performance.now() - newTime;

      if (scrollRef.current) {
        const offset =
          -svgHeight / 5 + (newTime / 1000) * pixelsPerSecond;
        scrollRef.current.setAttribute(
          "transform",
          `translate(0, ${offset})`
        );
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e) => {
      const midiData = e.target?.result as ArrayBuffer;
      const midi = new Midi(midiData);

      const parsedNotes: Note[] = midi.tracks[0].notes.map((note) => ({
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
    if (sampler?.samplerRef.current) {
      sampler.samplerRef.current.triggerAttackRelease(key, "1n");
    }
  };

  const octaves = Array.from({ length: 7 }, (_, i) => 1 + i);
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  const allWhiteKeys = octaves.flatMap((octave) =>
    whiteKeys.map((note) => ({ note: note + octave, base: note, octave }))
  );

  const allBlackKeys = octaves.flatMap((octave) =>
    blackKeys.map((note) => ({ note: note + octave, base: note, octave }))
  );

  return (
    <div style={{ textAlign: "center", maxHeight: `${svgHeight}` }}>
      <div
        className="PianoRoll-Bg"
        style={{
          width: svgWidth,
          height: svgHeight,
          overflow: "hidden",
          border: "2px solid black",
        }}
      >
        <svg width={svgWidth} height={svgHeight} xmlns="http://www.w3.org/2000/svg">
          <g ref={scrollRef} transform={`translate(0, -${svgHeight})`}>
            {notes.map((note, index) => {
              const noteBase = note.name.slice(0, -1);
              const octave = parseInt(note.name.slice(-1));
              const baseX = keyPositionMap[noteBase] || 0;

              const x = baseX + (octave - 1) * whiteCount * width;
              const y = svgHeight - (note.time / totalTime) * total_svg_height;
              const heightPx = note.duration * pixelsPerSecond;
              const yAdjusted = y - heightPx;

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={yAdjusted}
                    width={
                      note.name.includes("#")
                        ? whiteWidth * 0.6
                        : whiteWidth
                    }
                    height={heightPx}
                    rx={4}
                    ry={4}
                    fill={
                      note.hand?.includes("LH")
                        ? note.name.includes("#")
                          ? "rgba(131, 18, 207, 0.75)"
                          : "rgba(186, 94, 247, 0.75)"
                        : note.name.includes("#")
                        ? "rgba(8, 117, 201, 0.72)"
                        : "rgba(32, 173, 255, 0.72)"
                    }
                    stroke="#222"
                    strokeWidth={1}
                    cursor="pointer"
                    onClick={() => index && handleKeyClick([note.name])}
                  />

                  {showNote && (
                    <text
                      x={x + whiteWidth / 2}
                      y={yAdjusted + heightPx / 2}
                      fill="white"
                      fontSize={12}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      pointerEvents="none"
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

      <div style={{ marginLeft: `${svgWidth / 2 + 2}px` }}>
        {/* White Keys */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", zIndex: 0 }}>
            {allWhiteKeys.map(({ note }) => {
              const isSelected = playedKeysRef.current.has(note);
              const whiteKeyIndex = allWhiteKeys.findIndex(
                (k) =>
                  k.note.startsWith(note.charAt(0)) &&
                  k.octave === parseInt(note.slice(-1))
              );
              const left =
                whiteKeyIndex * width - width * ((7 * 7) / 2);

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
                  {showNote && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        width: "100%",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "black",
                        userSelect: "none",
                      }}
                    >
                      {note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Black Keys */}
          <div style={{ display: "flex", height: `${height}px`, zIndex: 1 }}>
            {allBlackKeys.map(({ note }) => {
              const isSelected = playedKeysRef.current.has(note);
              const whiteKeyIndex = allWhiteKeys.findIndex(
                (k) =>
                  k.note.startsWith(note.charAt(0)) &&
                  k.octave === parseInt(note.slice(-1))
              );

              const left =
                whiteKeyIndex * width +
                width * 0.7 -
                width * ((7 * 7) / 2);

              return (
                <div
                  key={note}
                  style={{
                    width: `${width * 0.625}px`,
                    height: `${height * 0.6}px`,
                    backgroundColor: isSelected
                      ? "rgb(8, 117, 201)"
                      : "black",
                    left: `${left}px`,
                    zIndex: 2,
                    position: "absolute",
                  }}
                >
                  {showNote && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        width: "100%",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "white",
                        userSelect: "none",
                      }}
                    >
                      {note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEEK BAR */}
      <div
        className="pianorollbar"
        style={{
          position: "relative",
          height: "8px",
          background: "#ddd",
          width: "100%",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={(e) => handleSeekClick(e)}
      >
        <div
          className="piano-progress"
          style={{
            width: `${pausedTime / ((totalTime + 2) * 10)}%`,
            height: "100%",
            background: "#2196f3",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ display: "flex" }}>
        <button
          onClick={() => {
            isPlaying ? pausePlayback() : playMidi();
          }}
          className="pianorollbtn"
        >
          {isPlaying ? (
            <img
              src="/icon/pause.svg"
              alt="pause-icon"
              style={{ width: "1.5rem", height: "1.5rem" }}
            />
          ) : (
            <img
              src="/icon/play.svg"
              alt="play-icon"
              style={{ width: "1.5rem", height: "1.5rem" }}
            />
          )}
        </button>

        <button onClick={() => restartMidi()} className="pianorollbtn">
          <img
            src="/icon/reload.svg"
            alt="reload-icon"
            style={{ width: "1.5rem", height: "1.5rem" }}
          />
        </button>

        <button onClick={() => seekBackward()} className="pianorollbtn">
          <img
            src="/icon/backwards.svg"
            alt="backwards-icon"
            style={{ width: "1.5rem", height: "1.5rem" }}
          />
        </button>

        <button onClick={() => seekForward()} className="pianorollbtn">
          <img
            src="/icon/forwards.svg"
            alt="forwards-icon"
            style={{ width: "1.5rem", height: "1.5rem" }}
          />
        </button>
      </div>
    </div>
  );
};

export default PianoRollApp;
