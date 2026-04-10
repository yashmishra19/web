import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id:          string;
  message:     string;
  type:        ToastType;
  duration:    number;
  isRemoving?: boolean;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const toastConfig: Record<
  ToastType,
  { classes: string; Icon: React.ElementType }
> = {
  success: {
    classes: 'bg-mint-50 border-mint-200 text-mint-800 dark:bg-mint-950/40 dark:border-mint-800 dark:text-mint-200',
    Icon: CheckCircle,
  },
  error: {
    classes: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200',
    Icon: XCircle,
  },
  info: {
    classes: 'bg-calm-50 border-calm-200 text-calm-800 dark:bg-calm-950/40 dark:border-calm-800 dark:text-calm-200',
    Icon: Info,
  },
  warning: {
    classes: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
    Icon: AlertTriangle,
  },
};

// ---------------------------------------------------------------------------
// useToast hook
// ---------------------------------------------------------------------------

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function removeToast(id: string) {
    // Mark for exit animation first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRemoving: true } : t))
    );
    // Then actually remove after the CSS transition completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }

  function showToast(message: string, type: ToastType = 'info', duration: number = 4000) {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  }

  return { toasts, showToast, removeToast };
}

// ---------------------------------------------------------------------------
// Individual toast item (handles enter animation)
// ---------------------------------------------------------------------------

function ToastItemComponent({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const { classes, Icon } = toastConfig[toast.type];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const isLeaving = !!toast.isRemoving;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border shadow-card transition-all duration-300',
        classes,
        isLeaving
          ? 'translate-x-full opacity-0'
          : visible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0'
      )}
    >
      <Icon size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Dismiss notification"
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToastContainer
// ---------------------------------------------------------------------------

interface ToastContainerProps {
  toasts:       ToastItem[];
  removeToast:  (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItemComponent
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToastContext + ToastProvider
// ---------------------------------------------------------------------------

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext must be used within a <ToastProvider>');
  }
  return ctx;
}
