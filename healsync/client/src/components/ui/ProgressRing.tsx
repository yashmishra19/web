interface ProgressRingProps {
  value:        number;          // 0–100
  size?:        number;
  strokeWidth?: number;
  color?:       string;
  trackColor?:  string;
  label?:       string;
  sublabel?:    string;
}

export default function ProgressRing({
  value,
  size        = 80,
  strokeWidth = 7,
  color       = '#22c55e',
  trackColor  = '#f3f4f6',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  const cx = size / 2;
  const cy = size / 2;

  const hasLabel    = !!label;
  const hasSublabel = !!sublabel;

  const labelY    = hasSublabel ? cy - 8 : cy;
  const sublabelY = cy + 10;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-label={label ? `${label}: ${value}%` : `${value}%`}
      role="img"
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />

      {/* Progress */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
      />

      {/* Center label */}
      {hasLabel && (
        <text
          x={cx}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
        >
          {label}
        </text>
      )}

      {/* Center sublabel */}
      {hasSublabel && (
        <text
          x={cx}
          y={sublabelY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fill="#9ca3af"
        >
          {sublabel}
        </text>
      )}
    </svg>
  );
}
