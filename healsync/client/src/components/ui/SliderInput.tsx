import { cn } from '@/lib/utils';

interface SliderInputProps {
  label:        string;
  value:        number;
  onChange:     (value: number) => void;
  min:          number;
  max:          number;
  step?:        number;
  leftLabel?:   string;
  rightLabel?:  string;
  showValue?:   boolean;
  colorMap?:    Record<number, string>;
  description?: string;
}

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step        = 1,
  leftLabel,
  rightLabel,
  showValue   = true,
  colorMap,
  description,
}: SliderInputProps) {
  const badgeClass = colorMap?.[value] ?? 'bg-mint-100 text-mint-700 dark:bg-mint-900/30 dark:text-mint-400';

  return (
    <div className="flex flex-col gap-1">
      {/* Row 1: label + value badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showValue && (
          <span className={cn('rounded-full px-2.5 py-0.5 text-sm font-medium', badgeClass)}>
            {value}
          </span>
        )}
      </div>

      {/* Row 2: description */}
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
      )}

      {/* Row 3: range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer
                   bg-gray-200 dark:bg-gray-700
                   accent-mint-500"
      />

      {/* Row 4: left / right labels */}
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">{leftLabel}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
