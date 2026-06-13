'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  href: string;
  displayName: string;
  heroSrc: string;
  heroAlt: string;
}

export function ProfileCapsule({ href, displayName, heroSrc, heroAlt }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto flex items-center bg-(--color-surface) rounded-full"
        style={{
          padding: collapsed ? 3 : '3px 12px 3px 3px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          transition: 'padding 380ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <Link
          href={href}
          className="relative flex-shrink-0 rounded-full overflow-hidden"
          style={{ width: 36, height: 36 }}
        >
          <Image src={heroSrc} alt={heroAlt} fill sizes="36px" className="object-cover" />
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflow: 'hidden',
            maxWidth: collapsed ? 0 : 200,
            opacity: collapsed ? 0 : 1,
            paddingLeft: collapsed ? 0 : 10,
            transition: 'max-width 380ms cubic-bezier(0.32, 0.72, 0, 1), opacity 220ms ease, padding-left 380ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <Link href={href} className="text-sm text-ink whitespace-nowrap leading-none">
            {displayName}
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); setDismissed(true); }}
            aria-label="Dismiss"
            className="flex-shrink-0 text-ink-muted hover:text-ink transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
