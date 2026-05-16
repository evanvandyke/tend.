'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-[family-name:var(--font-display)] transition-all duration-[150ms] ease-out cursor-pointer';

    const variants: Record<ButtonVariant, string> = {
      primary: [
        'bg-[var(--forest)] text-[var(--vellum)] text-[15px] font-semibold',
        'px-[18px] py-[10px] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] min-h-[44px]',
        'hover:bg-[var(--forest-dark)] hover:shadow-[var(--shadow-2)]',
        'active:bg-[#1F3724] active:scale-[0.98]',
        'disabled:bg-[var(--hairline)] disabled:text-[var(--text-tertiary)] disabled:opacity-70 disabled:cursor-not-allowed',
      ].join(' '),
      secondary: [
        'bg-transparent text-[var(--iron-gall)] text-[15px] font-semibold',
        'px-[18px] py-[10px] rounded-[var(--radius-md)] min-h-[44px]',
        'border border-[var(--engraved)]',
        'hover:bg-[var(--aged-paper)] hover:shadow-[var(--shadow-2)]',
        'active:scale-[0.98]',
        'disabled:opacity-70 disabled:cursor-not-allowed',
      ].join(' '),
      tertiary: [
        'bg-transparent text-[var(--forest)] text-[14px] font-medium',
        'underline decoration-[var(--hairline)]',
        'hover:decoration-[var(--engraved)]',
        'active:scale-[0.98]',
        'disabled:opacity-70 disabled:cursor-not-allowed',
      ].join(' '),
      destructive: [
        'bg-[var(--bordeaux)] text-[var(--vellum)] text-[15px] font-semibold',
        'px-[18px] py-[10px] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] min-h-[44px]',
        'hover:bg-[var(--bordeaux-dark)] hover:shadow-[var(--shadow-2)]',
        'active:scale-[0.98]',
        'disabled:opacity-70 disabled:cursor-not-allowed',
      ].join(' '),
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant };
