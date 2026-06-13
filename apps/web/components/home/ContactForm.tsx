"use client";

import { useState } from "react";

/**
 * Name / Email / Message → POST /api/contact. Pill fields and the blue
 * submit per the Contact frame.
 */
export function ContactForm({
  username,
  onSent,
}: {
  username: string;
  onSent?: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUsername: username, ...values }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setTimeout(() => onSent?.(), 900);
    } catch {
      setStatus("error");
    }
  }

  // placeholder=" " (space) lets CSS :placeholder-shown detect empty state without showing text
  const inputClass =
    "peer w-full rounded-(--radius-field) bg-field px-6 pt-7 pb-3 placeholder:opacity-0 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent";

  // Default = floated (has value). peer-placeholder-shown = centered (empty). peer-focus = floated (typing).
  const labelClass =
    "pointer-events-none absolute left-6 top-3.5 text-xs text-ink/50 transition-all duration-200 " +
    "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base " +
    "peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs";

  return (
    <div className="space-y-4">
      <div className="relative">
        <input type="text" id="f-name" placeholder=" " autoComplete="name"
          value={values.name} onChange={set("name")} className={inputClass} />
        <label htmlFor="f-name" className={labelClass}>Name</label>
      </div>

      <div className="relative">
        <input type="email" id="f-email" placeholder=" " autoComplete="email"
          value={values.email} onChange={set("email")} className={inputClass} />
        <label htmlFor="f-email" className={labelClass}>Email</label>
      </div>

      <div className="relative">
        <textarea id="f-message" placeholder=" " rows={5}
          value={values.message} onChange={set("message")}
          className={`${inputClass} resize-none`} />
        <label htmlFor="f-message"
          className="pointer-events-none absolute left-6 top-3.5 text-xs text-ink/50 transition-all duration-200 peer-placeholder-shown:top-7 peer-placeholder-shown:text-base peer-focus:top-3.5 peer-focus:text-xs">
          Message
        </label>
      </div>
      <div className="flex items-center justify-end gap-4 pt-2">
        {status === "error" && (
          <p className="text-sm text-ink-muted">Couldn&apos;t send — try again.</p>
        )}
        <button
          onClick={submit}
          disabled={status === "sending" || status === "sent"}
          className="rounded-full bg-accent px-8 py-4 text-white transition-opacity disabled:opacity-60"
        >
          {status === "sent" ? "Sent" : status === "sending" ? "Sending…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
