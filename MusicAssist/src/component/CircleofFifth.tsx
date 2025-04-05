import React from 'react';

interface Props {
  selectedKey: string | null;
}
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function CircleOfFifths({ selectedKey }: Props) {
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
    <svg width="300" height="300">
      <g transform={`translate(${centerX}, ${centerY})`}>
        {keys.map((key, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const x = radius * Math.sin(angle);
          const y = -radius * Math.cos(angle);
          const isSelected = selectedKey === key;

          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="24"
              fill={isSelected ? 'red' : 'black'}
              fontWeight={isSelected ? 'bold' : 'normal'}
              className="cursor-pointer"
            >
              {key}
            </text>
          );
        })}
      </g>
    </svg>
    </div>
  );
}
