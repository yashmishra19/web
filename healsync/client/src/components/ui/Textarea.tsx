import { forwardRef, TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:      string;
  error?:      string;
  helperText?: string;
  showCount?:  boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, showCount, id, required, className, value, maxLength, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId  = id ?? (label ? generatedId : undefined);
  const descId      = error || helperText ? `${textareaId}-desc` : undefined;

  const currentLength = typeof value === 'string' ? value.length : 0;
  const nearLimit     = maxLength !== undefined && currentLength >= maxLength - 20;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        maxLength={maxLength}
        required={required}
        aria-invalid={!!error}
        aria-describedby={descId}
        className={cn(
          error ? 'input-error' : 'input',
          'min-h-[100px] resize-y',
          className
        )}
        {...props}
      />

      <div className="flex items-start justify-between gap-2">
        {(error || helperText) && (
          <p
            id={descId}
            className={cn('text-xs flex-1', error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400')}
          >
            {error ?? helperText}
          </p>
        )}
        {showCount && maxLength !== undefined && (
          <p className={cn('text-xs ml-auto tabular-nums', nearLimit ? 'text-red-500' : 'text-gray-400')}>
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

export default Textarea;
