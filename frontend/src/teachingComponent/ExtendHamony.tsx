const MajorHarmonizationTriads: Record<string,string[]> = {
  "C":  ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  "C#": ["C#", "D#m", "Fm", "F#", "G#", "A#m", "Cdim"],
  "D":  ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
  "Eb": ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
  "E":  ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
  "F":  ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
  "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"],
  "G":  ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  "Ab": ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"],
  "A":  ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  "Bb": ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"],
  "B":  ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
};

const NaturalMinorHarmonizationTriads: Record<string, string[]> = {
  "A":  ["Am", "Bdim", "C", "Dm", "Em", "F", "G"],
  "Bb": ["Bbm", "Cdim", "Db", "Ebm", "Fm", "Gb", "Ab"],
  "B":  ["Bm", "C#dim", "D", "Em", "F#m", "G", "A"],
  "C":  ["Cm", "Ddim", "Eb", "Fm", "Gm", "Ab", "Bb"],
  "C#": ["C#m", "D#dim", "E", "F#m", "G#m", "A", "B"],
  "D":  ["Dm", "Edim", "F", "Gm", "Am", "Bb", "C"],
  "Eb": ["Ebm", "Fdim", "Gb", "Abm", "Bbm", "Cb", "Db"],
  "E":  ["Em", "F#dim", "G", "Am", "Bm", "C", "D"],
  "F":  ["Fm", "Gdim", "Ab", "Bbm", "Cm", "Db", "Eb"],
  "F#": ["F#m", "G#dim", "A", "Bm", "C#m", "D", "E"],
  "G":  ["Gm", "Adim", "Bb", "Cm", "Dm", "Eb", "F"],
  "Ab": ["Abm", "Bbdim", "Cb", "Dbm", "Ebm", "Fb", "Gb"],
};
