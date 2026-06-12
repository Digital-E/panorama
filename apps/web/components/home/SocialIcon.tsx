/** Brand icons for known platforms; falls back to a generic link glyph. */
export function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  if (key.includes("instagram")) {
    return (
      <svg {...common} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key === "x" || key.includes("twitter")) {
    return (
      <svg {...common} aria-hidden>
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    );
  }
  if (key.includes("youtube")) {
    return (
      <svg {...common} aria-hidden>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <path d="M10 14a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L11 5.93" />
      <path d="M14 10a5 5 0 00-7.07 0L4.8 12.12a5 5 0 007.07 7.07L13 18.07" />
    </svg>
  );
}
