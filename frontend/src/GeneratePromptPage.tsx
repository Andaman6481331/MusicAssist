import React, { useEffect, useState } from "react";
import "./based.css";
import { useLoading } from "./LoadingContext";
import { addGenerationRecord } from "./data/generations";
import { saveJsonRecord } from "./data/jsonGenerations"; //SaveJsonRecord
import { subscribeAuth } from "./auth";

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

const GENRE_PROMPTS: Record<string, string> = {
  classic: "Solo piano, pop style, key of C major, monophonic, minimalist staccato melody, single notes only, slow tempo. Isolated notes, dry recording, no reverb, no background noise, close mic, no sustain pedal, studio quality.",
  jazz: "Solo piano, Upbeat Stride Jazz style, 140 BPM, fun and jumpy, syncopated ragtime rhythm, walking bassline, swing eighth notes, bright piano tone, dry recording, no reverb, no background noise, clear note attacks.",
  pop: "Solo piano, Modern Pop arrangement, catchy repetitive melody, bright tone, 120 BPM, no sustain pedal, clear transients, dry studio sound, no reverb, no background noise, close mic, no sustain pedal, studio quality.",
};

/**
 * Build a tightly-constrained MusicGen prompt from the user's selections.
 */
function buildPrompt(
  genre: string,
  _duration: number
): string {
  return GENRE_PROMPTS[genre] || "";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PracticePage: React.FC = () => {
  // --- selection state (keyed by group name) ---
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showPopup,  setShowPopup]  = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [guidePopup, setGuidePopUp] = useState(false);
  const [filename,  setFilename]   = useState("Untitled");
  const [error,     setError]      = useState("");
  const [inputMiss, setInputMiss]  = useState("");

  const { setLoading, setPercent, setMessage, setGeneratedFilename, setShowCompletion } = useLoading();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAuth((user) => setUserId(user?.uid ?? null));
    return () => unsub();
  }, []);

  // ---------------------------------------------------------------------------
  // Option groups
  // ---------------------------------------------------------------------------
  const groups = [
    {
      name: "Genre",
      icon: "🎵",
      description: "Sets the musical style and feel",
      options: [
        { value: "classic",   label: "Classic",   icon: "🎻", hint: "Simple melody, slow tempo, minimalist" },
        { value: "pop",       label: "Pop",       icon: "🎤", hint: "Catchy melody, bright tone, 120 BPM" },
        { value: "jazz",      label: "Jazz",      icon: "🎷", hint: "Swing rhythm, walking bassline, jazz harmony" },
      ],
    },
    {
      name: "Duration",
      icon: "⏱️",
      description: "Length of the generated piece",
      options: [
        { value: "15", label: "15 s", hint: "Quick sketch" },
        { value: "30", label: "30 s", hint: "Short piece" },
        { value: "60", label: "60 s", hint: "Full piece" },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Derived prompt preview (shown to the user in the confirm popup)
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Generation handler
  // ---------------------------------------------------------------------------
  const handleFinalGenerate = async () => {
    if (!filename.trim()) {
      setError("Please enter a filename.");
      return;
    }

    // Check generation status
    try {
      const statusRes  = await fetch("http://localhost:8000/generation-status");
      const statusData = await statusRes.json();
      if (statusData.is_generating) {
        setError("A generation is already in progress. Please wait.");
        return;
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
      return;
    }

    // Check filename conflict
    try {
      const res  = await fetch(`http://localhost:8000/check-filename?name=${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (data.exists) {
        setError("Filename already exists — please choose a different name.");
        return;
      }
    } catch {
      setError("Error checking filename.");
      return;
    }

    const missing = groups.filter((g) => !selectedOptions[g.name]).map((g) => g.name);
    if (missing.length > 0) {
      setInputMiss(missing.join(", "));
      setErrorPopup(true);
      return;
    }

    const genre      = selectedOptions["Genre"];
    const duration   = Number(selectedOptions["Duration"] ?? 30);

    const textprompt = buildPrompt(genre, duration);
    console.log("[PROMPT]", textprompt);
    localStorage.setItem("mididuration", String(duration));

    setError("");
    setShowPopup(false);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/generate?prompt=${encodeURIComponent(textprompt)}&filename=${encodeURIComponent(filename)}&mididuration=${duration}`
      );
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(data.error ?? "Conflict — filename exists or generation in progress.");
          setPercent(0);
          setLoading(false);
          return;
        }
        throw new Error(data.error ?? "Generation failed");
      }

      if (data.error) {
        console.error("Backend error:", data.error, data.traceback);
        setError(data.error);
        setPercent(0);
        setLoading(false);
        return;
      }

      console.log("Generation result:", data);

      if (userId) {
        try {
          await addGenerationRecord(userId, {
            filename,
            difficulty: "",
            genre,
            key: "",
            durationSec: duration,
            prompt: textprompt,
            favorite: false,
          });
        } catch (e) {
          console.error("Failed saving record:", e);
        }
      }

      // Save generated JSON into Firestore
      if (userId) {
        try {
          await saveJsonRecord(
            userId,
            filename,      // generationId
            filename,      // displayName
            {
              tempo_bpm: data.tempo_bpm,
              total_time: data.total_time,
              notes: data.notes,
            }
          );

          console.log("JSON notes saved to Firestore");
        } catch (err) {
          console.error("Error saving JSON:", err);
          // Don't fail the whole process, but notify the user
          setError("Music generated but failed to save to cloud storage. You can still play it this session.");
        }
      }

      setMessage("Finishing your masterpiece...");
      setPercent(0);
      setGeneratedFilename(filename);
      setShowCompletion(true);
    } catch (err) {
      console.error("Error generating:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
      setPercent(0);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const select = (groupName: string, value: string) =>
    setSelectedOptions((prev) => ({ ...prev, [groupName]: value }));

  const allSelected = groups.every((g) => selectedOptions[g.name]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="modern-container" style={{ padding: "4rem 2rem" }}>
      <div className="glass-card" style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 className="modern-title" style={{ textAlign: "left", margin: 0 }}>
              Piano Architect
            </h1>
            <p style={{ color: "var(--text-dim)", fontSize: "1.05rem", marginTop: "0.4rem" }}>
              Design a playable AI piano piece — all selections guaranteed within 10-finger reach
            </p>
          </div>
          <button
            className="back-btn"
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.9rem", whiteSpace: "nowrap" }}
            onClick={() => setGuidePopUp(true)}
          >
            📖 How it Works
          </button>
        </div>

        {/* ── Option Groups ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {groups.map((group) => (
            <div key={group.name}>
              {/* Group header */}
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
                  {group.icon} {group.name}
                </span>
                <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "var(--text-dim)" }}>
                  {group.description}
                </span>
              </div>

              {/* Radio pills */}
              <div
                className="modern-radio-group"
                style={{ flexWrap: "wrap", gap: "0.6rem" }}
              >
                {group.options.map((option) => {
                  const isSelected = selectedOptions[group.name] === option.value;
                  return (
                    <label
                      key={option.value}
                      title={option.hint}
                      className={`modern-radio-label ${isSelected ? "active" : ""}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        cursor: "pointer",
                        padding: "0.6rem 1rem",
                        gap: "0.2rem",
                        minWidth: "90px",
                      }}
                    >
                      <input
                        value={option.value}
                        name={group.name}
                        type="radio"
                        className="modern-radio-input"
                        checked={isSelected}
                        onChange={() => select(group.name, option.value)}
                      />
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {"icon" in option ? `${(option as { icon: string }).icon} ` : ""}{option.label}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.3 }}>
                        {option.hint}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── Generate button ── */}
          <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem" }}>
            {!allSelected && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: "0.75rem", textAlign: "center" }}>
                Select all options above to continue
              </p>
            )}
            <button
              onClick={() => {
                const missing = groups
                  .filter((g) => !selectedOptions[g.name])
                  .map((g) => g.name);
                if (missing.length > 0) {
                  setInputMiss(missing.join(", "));
                  setErrorPopup(true);
                  return;
                }
                setError("");
                setShowPopup(true);
              }}
              className="start-btn"
              style={{
                width: "100%",
                padding: "1.2rem",
                fontSize: "1.1rem",
                opacity: allSelected ? 1 : 0.5,
                cursor: allSelected ? "pointer" : "not-allowed",
              }}
            >
              ✨ Compose with AI
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          Popups
      ══════════════════════════════════ */}
      {(showPopup || errorPopup || guidePopup) && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "20px",
          }}
        >
          {/* ── Confirm & name popup ── */}
          {showPopup && (
            <div className="glass-card" style={{ maxWidth: "540px", width: "100%" }}>
              <h2 className="modern-title" style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                Name Your Piece
              </h2>
              <p style={{ color: "var(--text-dim)", marginBottom: "1.25rem", fontSize: "0.95rem" }}>
                Give your composition a unique filename — it will be saved to your collection.
              </p>

              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., midnight_waltz"
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  boxSizing: "border-box",
                }}
              />


              {/* Selected params summary */}
              <div
                style={{
                  display: "flex", gap: "0.5rem", flexWrap: "wrap",
                  marginBottom: "1.25rem",
                }}
              >
                {Object.entries(selectedOptions).map(([k, v]) => (
                  <span
                    key={k}
                    style={{
                      background: "rgba(68,137,249,0.15)",
                      border: "1px solid rgba(68,137,249,0.3)",
                      borderRadius: "20px", padding: "0.3rem 0.75rem",
                      fontSize: "0.78rem", color: "var(--text-main)",
                    }}
                  >
                    {k}: <strong>{v}</strong>
                  </span>
                ))}
              </div>

              {error && (
                <p style={{ color: "#ef4444", fontSize: "0.88rem", marginBottom: "1rem" }}>
                  ⚠️ {error}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="start-btn"  style={{ flex: 1 }} onClick={handleFinalGenerate}>
                  🎹 Generate
                </button>
                <button className="back-btn"   style={{ flex: 1 }} onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Validation error popup ── */}
          {errorPopup && (
            <div className="glass-card" style={{ maxWidth: "420px", width: "100%" }}>
              <h2 className="modern-title" style={{ fontSize: "1.6rem", color: "#f87171" }}>
                Almost there!
              </h2>
              <p style={{ color: "var(--text-dim)", marginBottom: "2rem", lineHeight: 1.6 }}>
                Please select a choice for:{" "}
                <strong style={{ color: "var(--text-main)" }}>{inputMiss}</strong>
              </p>
              <button className="start-btn" style={{ width: "100%" }} onClick={() => setErrorPopup(false)}>
                Got it
              </button>
            </div>
          )}

          {/* ── How it Works popup ── */}
          {guidePopup && (
            <div className="glass-card" style={{ maxWidth: "500px", width: "100%" }}>
              <h2 className="modern-title" style={{ fontSize: "1.8rem", marginBottom: "1.25rem" }}>
                How it Works
              </h2>
              <div style={{ color: "var(--text-dim)", lineHeight: "1.9", marginBottom: "2rem" }}>
                <p>
                  <strong style={{ color: "var(--text-main)" }}>1. Pick your settings</strong><br />
                  Choose <em>Genre</em> and <em>Duration</em>.
                  Each setting directly shapes the music the AI creates.
                </p>
                <p>
                  <strong style={{ color: "var(--text-main)" }}>2. Playability is guaranteed</strong><br />
                  Every generated piece is constrained to notes reachable by two human hands —
                  no chord span wider than a tenth, and no more than 10 simultaneous notes.
                </p>
                <p>
                  <strong style={{ color: "var(--text-main)" }}>3. Listen & visualize</strong><br />
                  After generation, the piece appears in your interactive piano roll where you
                  can play along, slow it down, or export it.
                </p>
              </div>
              <button className="start-btn" style={{ width: "100%" }} onClick={() => setGuidePopUp(false)}>
                Let's go! 🎹
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticePage;