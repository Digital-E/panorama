"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Profile } from "@portfolio/schema";
import { Sheet } from "@/components/ui/Sheet";
import { ContactForm } from "./ContactForm";
import { SocialIcon } from "./SocialIcon";

type SheetName = "biography" | "experience" | "contact" | null;

export function HomeMenu({ profile }: { profile: Profile }) {
  const [expanded, setExpanded] = useState(false);
  const [sheet, setSheet] = useState<SheetName>(null);
  const closeSheet = () => setSheet(null);

  const [toast, setToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSent = () => {
    setSheet(null);
    setExpanded(false);
    setTimeout(() => {
      clearTimeout(toastTimeout.current);
      setToast(true);
      toastTimeout.current = setTimeout(() => setToast(false), 4000);
    }, 400);
  };

  const collapse = () => setExpanded(false);

  return (
    <>
      {/* Collapsed pill */}
      <button
        onClick={() => setExpanded(true)}
        aria-label="Open menu"
        className={`fixed left-1/2 top-3 z-50 hidden -translate-x-1/2 items-center gap-3 rounded-2xl bg-glass px-4 py-2.5 backdrop-blur-md transition-all duration-300 ease-out md:flex ${
          expanded
            ? "pointer-events-none -translate-y-12 scale-90 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <div className="text-left leading-tight">
          <p className="text-[15px]">{profile.displayName}</p>
          {profile.role && <p className="text-sm text-ink-muted">{profile.role}</p>}
        </div>
        <Image
          src={profile.hero.src}
          alt={profile.hero.alt}
          width={48}
          height={48}
          className="size-12 rounded-xl object-cover"
        />
      </button>

      {/* Expanded card */}
      <div
        className={`fixed left-1/2 top-3 z-50 hidden w-80 -translate-x-1/2 flex-col overflow-hidden rounded-(--radius-card) bg-surface shadow-xl transition-all duration-300 ease-out md:flex ${
          expanded
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src={profile.hero.src}
              alt={profile.hero.alt}
              width={40}
              height={40}
              className="size-10 rounded-xl object-cover"
            />
            <div className="leading-tight">
              <p className="text-[15px]">{profile.displayName}</p>
              {profile.role && <p className="text-sm text-ink-muted">{profile.role}</p>}
            </div>
          </div>
          <button
            onClick={collapse}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-edge text-ink-muted transition-colors hover:text-ink"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav rows */}
        <div className="border-t border-surface-edge">
          {profile.biography && (
            <NavRow label="Biography" onClick={() => setSheet("biography")} />
          )}
          {profile.experience.length > 0 && (
            <NavRow label="Experience" onClick={() => setSheet("experience")} />
          )}
          {profile.projects.length > 0 && (
            <NavRow
              label="Work"
              onClick={() => {
                collapse();
                setTimeout(
                  () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }),
                  300,
                );
              }}
            />
          )}
          {profile.contactEnabled && (
            <NavRow label="Contact" onClick={() => setSheet("contact")} />
          )}
        </div>

        {/* Social links */}
        {profile.social.length > 0 && (
          <div className="flex items-center gap-5 border-t border-surface-edge px-5 py-4">
            {profile.social.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <SocialIcon label={link.label} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {expanded && (
        <div className="fixed inset-0 z-40 hidden md:block" onClick={collapse} />
      )}

      {/* Sheets */}
      <Sheet open={sheet === "biography"} onClose={closeSheet} title="Biography">
        <div className="space-y-5 text-ink/90">
          {profile.biography?.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "experience"} onClose={closeSheet} title="Timeline">
        <ol className="space-y-10 border-l border-surface-edge pl-5">
          {profile.experience.map((entry) => (
            <li key={entry.id}>
              <p className="text-[15px] text-ink-muted">{entry.period}</p>
              <p className="mt-1 text-lg">{entry.title}</p>
              {entry.subtitle && (
                <p className="mt-0.5 text-ink-muted">{entry.subtitle}</p>
              )}
            </li>
          ))}
        </ol>
      </Sheet>

      <Sheet open={sheet === "contact"} onClose={closeSheet} title="Contact">
        <ContactForm username={profile.username} onSent={handleSent} />
      </Sheet>

      <div
        aria-live="polite"
        className={`fixed inset-x-(--spacing-gutter) bottom-(--spacing-gutter) z-50 mx-auto max-w-(--container-column) rounded-(--radius-sheet) bg-surface px-6 py-5 shadow-xl transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <p className="text-ink">Thanks for getting in touch. I&apos;ll get back to you soon.</p>
      </div>
    </>
  );
}

function NavRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-edge/40"
    >
      <span className="text-[15px]">{label}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted" />
      </svg>
    </button>
  );
}
