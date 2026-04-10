import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 page-enter">
      <div className="card w-full max-w-sm text-center flex flex-col items-center gap-4">
        <span className="text-5xl" role="img" aria-label="leaf">🌿</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Page not found</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
