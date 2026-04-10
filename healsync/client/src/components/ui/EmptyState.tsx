import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void };
}

const DefaultIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 text-gray-400"
    aria-hidden="true"
  >
    <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.75 8.66A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      {/* Icon container */}
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {icon ?? <DefaultIcon />}
      </div>

      {/* Title */}
      <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</p>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto">{description}</p>
      )}

      {/* Action */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="btn-secondary mt-4"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
