"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Profile } from "@portfolio/schema";
import { Sheet } from "@/components/ui/Sheet";
import { ContactForm } from "./ContactForm";

type SheetName = "biography" | "experience" | "contact" | null;

export function Navbar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState<SheetName>(null);
  const close = () => setOpen(null);

  const [toast, setToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSent = () => {
    setOpen(null);
    setTimeout(() => {
      clearTimeout(toastTimeout.current);
      setToast(true);
      toastTimeout.current = setTimeout(() => setToast(false), 4000);
    }, 400);
  };

  return (
    <>
      <header className="sticky top-0 z-40 hidden items-center justify-between gap-4 bg-canvas/80 px-(--spacing-gutter) py-3 backdrop-blur-md md:flex">
        <div className="flex items-center gap-3">
          <Image
            src={profile.hero.src}
            alt={profile.hero.alt}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="text-[15px]">{profile.displayName}</p>
            {profile.role && <p className="text-sm text-ink-muted">{profile.role}</p>}
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {profile.biography && (
            <button
              onClick={() => setOpen("biography")}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Biography
            </button>
          )}
          {profile.experience.length > 0 && (
            <button
              onClick={() => setOpen("experience")}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Experience
            </button>
          )}
          {profile.projects.length > 0 && (
            <button
              onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Work
            </button>
          )}
          {profile.contactEnabled && (
            <button
              onClick={() => setOpen("contact")}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Contact
            </button>
          )}
        </nav>
      </header>

      <Sheet open={open === "biography"} onClose={close} title="Biography">
        <div className="space-y-5 text-ink/90">
          {profile.biography?.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Sheet>

      <Sheet open={open === "experience"} onClose={close} title="Timeline">
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

      <Sheet open={open === "contact"} onClose={close} title="Contact">
        <ContactForm username={profile.username} onSent={handleSent} />
      </Sheet>

      <div
        aria-live="polite"
        className={`fixed inset-x-(--spacing-gutter) bottom-(--spacing-gutter) z-50 mx-auto max-w-(--container-column) rounded-(--radius-sheet) bg-surface px-6 py-5 shadow-xl transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <p className="text-ink">Thanks for getting in touch. I&apos;ll get back to you soon.</p>
      </div>
    </>
  );
}
