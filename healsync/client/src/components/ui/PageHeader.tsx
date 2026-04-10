import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
  backHref?: string;
}

export default function PageHeader({ title, subtitle, action, backHref }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      {/* Left column */}
      <div className="flex flex-col">
        {backHref && (
          <Link
            to={backHref}
            className="flex items-center gap-1 mb-1 text-sm text-gray-400
                       hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-fit"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Back
          </Link>
        )}
        <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: action slot */}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
