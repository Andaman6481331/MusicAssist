from music21 import converter, chord, note, tempo, stream

c = chord.Chord(["C4", "E4", "G4"])
print("Chord pitches:", c.pitches)
print("Root:", c.root())
print("Quality:", c.quality)
print("Common name:", c.commonName)
print("Inversion:", c.inversion())

# 2. Test with an inverted chord
c_inv = chord.Chord(["E4", "G4", "C5"])
print("\nInverted Chord pitches:", c_inv.pitches)
print("Root:", c_inv.root())
print("Quality:", c_inv.quality)
print("Common name:", c_inv.commonName)
print("Inversion:", c_inv.inversion())

# 3. Get intervals of each note from root
print("\nNote roles in the chord:")
for pitch in c.pitches:
    interval = c.semitonesFromChordStep(c.pitches.index(pitch) + 1)
    print(f"{pitch.nameWithOctave} is {interval} semitones from the root")

# 4. Analyze multiple chords in a stream
chord1 = chord.Chord(["D3", "F3", "A3"])  #Dm
chord2 = chord.Chord(["E3", "G3", "B3"])  #Em
chord3 = chord.Chord(["F3", "A3", "C4"])  #F

s = stream.Stream([chord1, chord2, chord3])

print("\nAnalyzing chords in stream:")
for ch in s.recurse().getElementsByClass(chord.Chord):
    print("Chord:", ch.pitchedCommonName)
    print(" Root:", ch.root())
    print(" Quality:", ch.quality)
    print(" Inversion:", ch.inversion())
    print(" Notes:", [p.nameWithOctave for p in ch.pitches])
    print("---")


# help(c)
# dir(c)                # List of all attributes/methods
# c.root()              # Returns the root
# c.quality             # Returns 'major'
# c.commonName