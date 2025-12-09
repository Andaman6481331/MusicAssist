const minorChordNotes: Record<string, string[]> = {
  C: ["C", "Eb", "G"],        // C minor
  "C#": ["C#", "E", "G#"],    // C# minor
  D: ["D", "F", "A"],         // D minor
  "D#": ["D#", "F#", "A#"],   // D# minor (Enharmonic: Eb minor)
  E: ["E", "G", "B"],         // E minor
  F: ["F", "Ab", "C"],        // F minor
  "F#": ["F#", "A", "C#"],    // F# minor
  G: ["G", "Bb", "D"],        // G minor
  "G#": ["G#", "B", "D#"],    // G# minor (Enharmonic: Ab minor)
  A: ["A", "C", "E"],         // A minor
  "A#": ["A#", "C#", "F"],    // A# minor (Enharmonic: Bb minor)
  B: ["B", "D", "F#"],        // B minor
};

const NaturalMinorScales: Record<string, string[]> = {
  Cm:  ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4", "C5"],
  "C#m": ["C#4", "D#4", "E4", "F#4", "G#4", "A4", "B4", "C#5"],
  Dm:  ["D4", "E4", "F4", "G4", "A4", "Bb4", "C5", "D5"],
  "D#m": ["D#4", "F4", "F#4", "G#4", "A#4", "B4", "C#5", "D#5"], // (Enharmonic: Eb minor)
  Em:  ["E4", "F#4", "G4", "A4", "B4", "C5", "D5", "E5"],
  Fm:  ["F4", "G4", "Ab4", "Bb4", "C5", "Db5", "Eb5", "F5"],
  "F#m": ["F#4", "G#4", "A4", "B4", "C#5", "D5", "E5", "F#5"],
  Gm:  ["G4", "A4", "Bb4", "C5", "D5", "Eb5", "F5", "G5"],
  "G#m": ["G#4", "A#4", "B4", "C#5", "D#5", "E5", "F#5", "G#5"], // Enharmonic: Ab minor
  Am:  ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
  "A#m": ["A#4", "C5", "C#5", "D#5", "F5", "F#5", "G#5", "A#5"], // Enharmonic: Bb minor
  Bm:  ["B4", "C#5", "D5", "E5", "F#5", "G5", "A5", "B5"]
};
