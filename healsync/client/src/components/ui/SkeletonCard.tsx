interface SkeletonCardProps {
  lines?:       number;
  showAvatar?:  boolean;
}

export default function SkeletonCard({ lines = 3, showAvatar = false }: SkeletonCardProps) {
  const middleCount = Math.max(0, lines - 2);

  return (
    <div className="card animate-pulse">
      {/* Avatar row */}
      {showAvatar && (
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
          <div className="flex flex-col gap-1.5 justify-center">
            <div className="w-24 h-3 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="w-16 h-2.5 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      )}

      {/* Lines */}
      {lines >= 1 && (
        <div className="w-3/4 h-4 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
      )}
      {Array.from({ length: middleCount }).map((_, i) => (
        <div key={i} className="w-full h-3 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
      ))}
      {lines >= 2 && (
        <div className="w-1/2 h-3 rounded bg-gray-100 dark:bg-gray-800" />
      )}
    </div>
  );
}
