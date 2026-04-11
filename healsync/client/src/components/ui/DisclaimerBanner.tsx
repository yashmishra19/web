import { Info } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-xl border border-calm-200 bg-calm-50 px-4 py-3
                 dark:border-calm-800 dark:bg-calm-950/30"
    >
      <Info
        size={16}
        className="mt-0.5 flex-shrink-0 text-calm-500 dark:text-calm-400"
        aria-hidden="true"
      />
      <p className="text-xs leading-relaxed text-calm-700 dark:text-calm-300">
        <strong>Not medical advice.</strong>
      </p>
    </div>
  );
}
