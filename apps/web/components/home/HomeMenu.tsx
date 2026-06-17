"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Profile } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { ContactForm } from "./ContactForm";

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

  const hasNav =
    profile.experience.length > 0 || profile.projects.length > 0 || profile.contactEnabled;

  return (
    <>
      {/* Pill — top-left, desktop only */}
      <button
        onClick={() => setExpanded(true)}
        className="fixed left-3 top-3 z-50 hidden items-center gap-3 rounded-2xl bg-glass px-4 py-2.5 backdrop-blur-md transition-opacity hover:opacity-80 md:flex"
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

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 hidden transition-opacity duration-300 md:block ${
          expanded ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setExpanded(false)}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed bottom-3 left-3 top-3 z-50 hidden w-[380px] flex-col gap-3 overflow-hidden rounded-(--radius-card) bg-canvas p-3 shadow-2xl transition-transform duration-400 ease-out md:flex ${
          expanded ? "translate-x-0" : "-translate-x-[calc(100%+12px)]"
        }`}
      >
        {/* Header: name + role + avatar */}
        <div className="flex items-start justify-between px-3 pb-1 pt-4">
          <div>
            <h2 className="text-3xl leading-tight">{profile.displayName}</h2>
            {profile.role && <p className="mt-1 text-lg text-ink-muted">{profile.role}</p>}
          </div>
          <Image
            src={profile.hero.src}
            alt={profile.hero.alt}
            width={120}
            height={120}
            className="size-[120px] rounded-2xl object-cover"
          />
        </div>

        {/* Biography */}
        {profile.biography && (
          <Card>
            <button
              onClick={() => setSheet("biography")}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <span className="text-lg">Biography</span>
              <span className="text-sm text-ink-muted">See more</span>
            </button>
          </Card>
        )}

        {/* Experience / Work / Contact */}
        {hasNav && (
          <Card>
            <ul>
              {profile.experience.length > 0 && (
                <li>
                  <button
                    onClick={() => setSheet("experience")}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-lg">Experience</span>
                    <Chevron />
                  </button>
                </li>
              )}
              {profile.projects.length > 0 && (
                <li>
                  {profile.experience.length > 0 && (
                    <div className="mx-6 h-px bg-surface-edge" />
                  )}
                  <button
                    onClick={() => {
                      setExpanded(false);
                      setTimeout(
                        () =>
                          document
                            .getElementById("work")
                            ?.scrollIntoView({ behavior: "smooth" }),
                        400,
                      );
                    }}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-lg">Work</span>
                    <Chevron />
                  </button>
                </li>
              )}
              {profile.contactEnabled && (
                <li>
                  {(profile.experience.length > 0 || profile.projects.length > 0) && (
                    <div className="mx-6 h-px bg-surface-edge" />
                  )}
                  <button
                    onClick={() => setSheet("contact")}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-lg">Contact</span>
                    <Chevron />
                  </button>
                </li>
              )}
            </ul>
          </Card>
        )}

        {/* Home indicator */}
        <div className="mt-auto flex justify-center pb-1 pt-3">
          <div className="h-1 w-32 rounded-full bg-surface-edge" />
        </div>
      </div>

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

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-muted"
      />
    </svg>
  );
}
