'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ClipboardList, Hammer, Leaf, Settings } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Now', href: '/now', icon: CalendarDays },
  { label: 'Tasks', href: '/browse', icon: ClipboardList },
  { label: 'Projects', href: '/projects', icon: Hammer },
  { label: 'Routines', href: '/modules', icon: Leaf },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function BottomNav({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={[
        'fixed bottom-0 left-0 right-0 z-40',
        'h-16 bg-[var(--vellum)] border-t border-[var(--hairline)]',
        'pb-[env(safe-area-inset-bottom)]',
        'flex items-center justify-around',
        className,
      ].join(' ')}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'flex flex-col items-center justify-center gap-[4px] min-w-[44px] min-h-[44px]',
              'transition-colors duration-[150ms] ease-out',
            ].join(' ')}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              className={isActive ? 'text-[var(--forest)]' : 'text-[var(--text-tertiary)]'}
            />
            <span
              className={[
                'font-[family-name:var(--font-display)] text-[9px] font-semibold uppercase tracking-[0.1em]',
                isActive ? 'text-[var(--iron-gall)]' : 'text-[var(--text-tertiary)]',
              ].join(' ')}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export { BottomNav };
