"use client";

import { useState } from "react";
import type { Profile } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { ContactForm } from "./ContactForm";

type SheetName = "biography" | "experience" | "contact" | null;

/**
 * The Biography row card and the Experience / Work / Contact nav group.
 * Biography, Experience and Contact open as bottom sheets (per the
 * frames); Work scrolls to the project cards below.
 */
export function SectionsNav({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState<SheetName>(null);
  const close = () => setOpen(null);

  const rows: { label: string; onClick: () => void }[] = [];
  if (profile.experience.length > 0)
    rows.push({ label: "Experience", onClick: () => setOpen("experience") });
  if (profile.projects.length > 0)
    rows.push({
      label: "Work",
      onClick: () =>
        document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }),
    });
  if (profile.contactEnabled)
    rows.push({ label: "Contact", onClick: () => setOpen("contact") });

  return (
    <>
      {profile.biography && (
        <Card>
          <button
            onClick={() => setOpen("biography")}
            className="flex w-full items-center justify-between px-6 py-5 text-left"
          >
            <span className="text-lg">Biography</span>
            <span className="text-sm text-ink-muted">See more</span>
          </button>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <ul>
            {rows.map((row, i) => (
              <li key={row.label}>
                {i > 0 && <div className="mx-6 h-px bg-surface-edge" />}
                <button
                  onClick={row.onClick}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-lg">{row.label}</span>
                  <Chevron />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Sheet open={open === "biography"} onClose={close} title="Biography">
        <div className="space-y-5 text-[17px] leading-relaxed text-ink/90">
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
              <p className="mt-1 text-xl">{entry.title}</p>
              {entry.subtitle && (
                <p className="mt-0.5 text-[17px] text-ink-muted">{entry.subtitle}</p>
              )}
            </li>
          ))}
        </ol>
      </Sheet>

      <Sheet open={open === "contact"} onClose={close} title="Contact">
        <ContactForm username={profile.username} onSent={close} />
      </Sheet>
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
