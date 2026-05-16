'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onChange, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={[
          'relative flex items-center justify-center w-[44px] h-[44px] cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        ].join(' ')}
        {...props}
      >
        <span
          className={[
            'flex items-center justify-center w-[20px] h-[20px] rounded-full',
            'transition-all duration-[250ms] ease-out',
            'motion-reduce:transition-none',
            checked
              ? 'bg-[var(--forest)] border-[1.5px] border-[var(--forest)]'
              : 'bg-transparent border-[1.5px] border-[var(--hairline)] hover:border-[var(--engraved)]',
          ].join(' ')}
        >
          {checked && (
            <Check
              size={12}
              strokeWidth={1.5}
              className="text-white"
            />
          )}
        </span>
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
