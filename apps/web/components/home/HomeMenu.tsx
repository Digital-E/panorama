"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Profile } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { ContactForm } from "./ContactForm";

type SheetName = "biography" | "experience" | "contact" | null;
type CardPage = "menu" | "biography" | "experience" | "contact";

export function HomeMenu({ profile }: { profile: Profile }) {
  const [expanded, setExpanded] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [cardPage, setCardPage] = useState<CardPage>("menu");
  const [displayedPage, setDisplayedPage] = useState<CardPage>("menu");
  const [sheet, setSheet] = useState<SheetName>(null);
  const closeSheet = () => setSheet(null);

  const [toast, setToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const goToPage = (page: Exclude<CardPage, "menu">) => {
    setDisplayedPage(page);
    setCardPage(page);
  };

  const goBack = () => {
    setCardPage("menu");
    setTimeout(() => setDisplayedPage("menu"), 300);
  };

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => { setCardPage("menu"); setDisplayedPage("menu"); }, 300);
  };

  const handleSent = () => {
    setSheet(null);
    setExpanded(false);
    setShowCard(false);
    setTimeout(() => { setCardPage("menu"); setDisplayedPage("menu"); }, 300);
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
      {/* Top-left — desktop only */}
      <div className="fixed left-3 top-3 z-50 hidden flex-col items-start gap-2 md:flex">
        <div className="flex items-center px-4 py-2.5">
          <div className="text-left leading-tight">
            <p className="text-[15px]">{profile.displayName}</p>
            {profile.role && <p className="text-sm text-ink-muted">{profile.role}</p>}
          </div>
        </div>

        <button
          onClick={() => setShowCard(true)}
          aria-label="Open menu"
          className="px-4 py-1 text-ink-muted transition-opacity hover:opacity-80 cursor-pointer"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor" aria-hidden>
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="8" cy="2" r="1.5" />
            <circle cx="14" cy="2" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showCard ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeCard}
      />

      {/* Centered card */}
      <div
        className={`fixed left-3 top-3 z-50 w-[400px] overflow-hidden rounded-(--radius-card) bg-canvas shadow-2xl transition-all duration-300 ${showCard ? "opacity-100 blur-0 scale-100 pointer-events-auto" : "opacity-0 blur-sm scale-95 pointer-events-none"}`}
      >
        {/* Slide wrapper — 200% wide, two panels side by side */}
        <div
          className={`flex transition-transform duration-300 ease-in-out ${cardPage !== "menu" ? "-translate-x-1/2" : ""}`}
          style={{ width: "200%" }}
        >
          {/* ── Menu panel ── */}
          <div className={`w-1/2 transition-opacity duration-300 ${cardPage !== "menu" ? "opacity-0" : "opacity-100"}`}>
            <div className="px-6 pb-4 pt-6">
              <h2 className="text-[15px] leading-tight">{profile.displayName}</h2>
              {profile.role && <p className="mt-1 text-[15px] text-ink-muted">{profile.role}</p>}
            </div>
            <ul className="pb-2">
              {profile.biography && (
                <li>
                  <div className="mx-6 h-px bg-surface-edge" />
                  <button
                    onClick={() => goToPage("biography")}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-[15px]">Biography</span>
                    <span className="text-[15px] text-ink-muted">See more</span>
                  </button>
                </li>
              )}
              {profile.experience.length > 0 && (
                <li>
                  <div className="mx-6 h-px bg-surface-edge" />
                  <button
                    onClick={() => goToPage("experience")}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-[15px]">Experience</span>
                    <Chevron />
                  </button>
                </li>
              )}
              {profile.projects.length > 0 && (
                <li>
                  <div className="mx-6 h-px bg-surface-edge" />
                  <button
                    onClick={() => {
                      closeCard();
                      setTimeout(
                        () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }),
                        200,
                      );
                    }}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-[15px]">Work</span>
                    <Chevron />
                  </button>
                </li>
              )}
              {profile.contactEnabled && (
                <li>
                  <div className="mx-6 h-px bg-surface-edge" />
                  <button
                    onClick={() => goToPage("contact")}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-[15px]">Contact</span>
                    <Chevron />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* ── Detail panel ── */}
          <div className="w-1/2">
            <div className="flex items-center gap-3 px-6 pt-6 pb-6">
              <button
                onClick={goBack}
                aria-label="Back"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <BackChevron />
              </button>
              <h2 className="text-[15px]">
                {displayedPage === "biography"
                  ? "Biography"
                  : displayedPage === "experience"
                  ? "Experience"
                  : "Contact"}
              </h2>
            </div>
            <div className="px-6 pb-6">
              {displayedPage === "biography" && (
                <div className="space-y-4 text-[14px] text-ink/90 leading-relaxed">
                  {profile.biography?.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
              {displayedPage === "experience" && (
                <ol className="space-y-8 border-l border-surface-edge pl-5">
                  {profile.experience.map((entry) => (
                    <li key={entry.id}>
                      <p className="text-[13px] text-ink-muted">{entry.period}</p>
                      <p className="mt-1 text-[15px]">{entry.title}</p>
                      {entry.subtitle && (
                        <p className="mt-0.5 text-[13px] text-ink-muted">{entry.subtitle}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {displayedPage === "contact" && (
                <ContactForm username={profile.username} onSent={handleSent} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop — slide-in panel */}
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
                  {profile.experience.length > 0 && <div className="mx-6 h-px bg-surface-edge" />}
                  <button
                    onClick={() => {
                      setExpanded(false);
                      setTimeout(
                        () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }),
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
              {entry.subtitle && <p className="mt-0.5 text-ink-muted">{entry.subtitle}</p>}
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

function BackChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3.5L5.5 8L10 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
