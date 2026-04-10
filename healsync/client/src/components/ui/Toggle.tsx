interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Toggle({ checked, onChange, disabled = false, size = 'md' }: ToggleProps) {
  const isMd = size === 'md';

  const trackClasses = [
    'rounded-full transition-colors duration-200',
    isMd ? 'w-11 h-6' : 'w-9 h-5',
    checked ? 'bg-mint-500' : 'bg-gray-200 dark:bg-gray-700',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  ].filter(Boolean).join(' ');

  const thumbClasses = [
    'block rounded-full bg-white shadow-sm transition-transform duration-200',
    isMd ? 'w-5 h-5' : 'w-4 h-4',
    checked ? (isMd ? 'translate-x-5' : 'translate-x-4') : 'translate-x-0.5'
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center shrink-0 ${trackClasses}`}
    >
      <span className={thumbClasses} />
    </button>
  );
}
