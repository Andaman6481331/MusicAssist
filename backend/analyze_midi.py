from music21 import converter, chord, note
from collections import defaultdict

# def analyze_midi_file(file_path):
#     score = converter.parse(file_path)
#     chordified = score.chordify()
    
#     result = []

#     for element in chordified.flat.notesAndRests:
#         if isinstance(element, chord.Chord):
#             for pitch in element.pitches:
#                 result.append({
#                     "name": pitch.nameWithOctave,
#                     "midi": pitch.midi,
#                     "time": round(float(element.offset),2),
#                     "duration": round(float(pitch.quarterLength),2),
#                     # "chord": element.fullName,
#                     "root": element.root().name,
#                     # "pitches": [p.midi for p in element.pitches]
#                 })
    
#     return result

def analyze_and_group_notes(file_path):
    score = converter.parse(file_path)
    raw_notes = []

    # Step 1: Extract individual notes from all parts
    for part in score.parts:
        for element in part.flat.notes:
            if isinstance(element, note.Note):
                raw_notes.append({
                    "name": element.nameWithOctave,
                    "midi": element.pitch.midi,
                    "time": round(float(element.offset), 2),
                    "duration": round(float(element.quarterLength), 2),
                    "velocity": 64  # Placeholder value
                })

    # Step 2: Group notes by start time (within a small threshold)
    grouped_notes = defaultdict(list)
    time_threshold = 0.05  # Notes within 50ms are considered simultaneous

    for note_obj in raw_notes:
        inserted = False
        for group_time in grouped_notes:
            if abs(note_obj["time"] - group_time) <= time_threshold:
                grouped_notes[group_time].append(note_obj)
                inserted = True
                break
        if not inserted:
            grouped_notes[note_obj["time"]].append(note_obj)

    # Step 3: Optionally assign left/right hand and format output
    result = []
    for group_time in sorted(grouped_notes.keys()):
        group = grouped_notes[group_time]
        for note_obj in group:
            note_obj["hand"] = "left" if note_obj["midi"] < 60 else "right"
        result.extend(group)

    return result

if __name__ == "__main__":
    file_path = "../Collection/Test1115(1)_basic_pitch.mid"
    # chords = analyze_midi_file(file_path)
    chords = analyze_and_group_notes(file_path)
    print(chords)