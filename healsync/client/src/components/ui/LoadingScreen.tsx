export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="animate-pulse">
          <div className="h-16 w-16 rounded-2xl bg-mint-500 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-9 w-9"
              aria-hidden="true"
            >
              {/* Leaf + plus mark */}
              <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.75 8.66A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8"  y1="12" x2="16" y2="12" />
            </svg>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          Loading HealSync…
        </p>
      </div>
    </div>
  );
}
