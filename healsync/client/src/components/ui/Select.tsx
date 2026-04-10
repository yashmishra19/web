import { forwardRef, SelectHTMLAttributes, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  error?:       string;
  helperText?:  string;
  options:      SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helperText, options, placeholder, id, required, className, ...props },
  ref
) {
  const generatedId = useId();
  const selectId    = id ?? (label ? generatedId : undefined);
  const descId      = error || helperText ? `${selectId}-desc` : undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={descId}
          className={cn(
            error ? 'input-error' : 'input',
            'appearance-none pr-10',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {(error || helperText) && (
        <p
          id={descId}
          className={cn('text-xs', error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400')}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
