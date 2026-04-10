import { cn } from '@/lib/utils';

type MoodSize = 'sm' | 'md';

interface MoodPickerProps {
  value:     number | null;   // 1–5
  onChange:  (value: number) => void;
  label?:    string;
  size?:     MoodSize;
}

const moodMap: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😔', label: 'Very low', color: 'text-red-400'    },
  2: { emoji: '😕', label: 'Low',      color: 'text-orange-400' },
  3: { emoji: '😐', label: 'Neutral',  color: 'text-yellow-400' },
  4: { emoji: '🙂', label: 'Good',     color: 'text-mint-400'   },
  5: { emoji: '😊', label: 'Great',    color: 'text-mint-600'   },
};

const sizeMap: Record<MoodSize, { btn: string; emoji: string }> = {
  sm: { btn: 'w-10 h-10', emoji: 'text-xl' },
  md: { btn: 'w-12 h-12', emoji: 'text-2xl' },
};

export default function MoodPicker({
  value,
  onChange,
  label = 'How are you feeling?',
  size  = 'md',
}: MoodPickerProps) {
  const { btn, emoji } = sizeMap[size];
  const selectedMood   = value !== null ? moodMap[value] : null;

  return (
    <div>
      {/* Label */}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>

      {/* Emoji buttons */}
      <div className="flex gap-2 justify-between mt-2">
        {([1, 2, 3, 4, 5] as const).map((level) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-label={moodMap[level].label}
              aria-pressed={isSelected}
              className={cn(
                btn,
                emoji,
                'rounded-full flex items-center justify-center transition-all duration-150',
                isSelected
                  ? 'ring-2 ring-mint-500 bg-mint-50 dark:bg-mint-900/30 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {moodMap[level].emoji}
            </button>
          );
        })}
      </div>

      {/* Selected mood label */}
      {selectedMood && (
        <p className={cn('text-xs text-center mt-1 transition-all duration-200', selectedMood.color)}>
          {selectedMood.label}
        </p>
      )}
    </div>
  );
}
