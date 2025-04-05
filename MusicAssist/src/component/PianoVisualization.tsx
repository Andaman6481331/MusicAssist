import React, { useState } from 'react';
import * as Tone from 'tone';

const keys = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const keyNotes: Record<string, string> = {
  C: 'C4',
  'C#': 'C#4',
  D: 'D4',
  'D#': 'D#4',
  E: 'E4',
  F: 'F4',
  'F#': 'F#4',
  G: 'G4',
  'G#': 'G#4',
  A: 'A4',
  'A#': 'A#4',
  B: 'B4',
};

const PianoVisualizer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('C');

  const handleKeyClick = (key: string) => {
    setSelectedKey(key);
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(keyNotes[key], '8n'); // Play the corresponding note
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div style={{ display: 'flex' }}>
        {keys.map((key) => {
          const isSelected = key === selectedKey;
          return (
            <div
              key={key}
              onClick={() => handleKeyClick(key)}
              style={{
                width: '40px',
                height: '150px',
                backgroundColor: isSelected ? 'rgb(98, 208, 220)' : 'white',
                border: '1px solid black',
                margin: '0 2px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {key.includes('#') ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    width: '15px',
                    height: '80px',
                    backgroundColor: 'black',
                    zIndex: 1
                  }}
                ></div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PianoVisualizer;
