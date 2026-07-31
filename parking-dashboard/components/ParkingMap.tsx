type Slot = {
  id: string;
  status: string;
  points: number[][];
};

interface ParkingMapProps {
  slots: Slot[];
}

export default function ParkingMap({ slots }: ParkingMapProps) {
  return (
    <svg
    viewBox="150 250 180 180"
    width="100%"
    height="100%"
>
    
      {slots.map((slot) => (
        <g key={slot.id}>
          <polygon
            points={slot.points
              .map((p) => p.join(","))
              .join(" ")}
            fill={
              slot.status === "Occupied"
                ? "#ff3b5c"
                : "#00ff88"
            }
            stroke="white"
            strokeWidth="2"
          />

          <text
            x={
              slot.points.reduce((a, b) => a + b[0], 0) /
              slot.points.length
            }
            y={
              slot.points.reduce((a, b) => a + b[1], 0) /
              slot.points.length
            }
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {slot.id}
          </text>
        </g>
      ))}
    </svg>
  );
}