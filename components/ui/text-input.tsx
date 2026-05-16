'use client';

import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-[var(--space-xs)]">
        {label && (
          <label
            htmlFor={inputId}
            className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--iron-gall)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'bg-[var(--vellum)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
            'font-[family-name:var(--font-body)] text-[16px] text-[var(--iron-gall)]',
            'px-[14px] py-[12px] min-h-[44px]',
            'placeholder:text-[var(--text-tertiary)] placeholder:italic',
            'focus:border-[2px] focus:border-[var(--forest)] focus:px-[13px] focus:py-[11px] focus:outline-none',
            'transition-all duration-[150ms] ease-out',
            error ? 'border-[var(--bordeaux)]' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--bordeaux)]">
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export { TextInput };
export type { TextInputProps };
