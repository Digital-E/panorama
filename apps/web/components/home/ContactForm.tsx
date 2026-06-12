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

  const fieldClass =
    "w-full rounded-(--radius-field) bg-field px-6 py-5 text-[17px] placeholder:text-ink/80 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        autoComplete="name"
        value={values.name}
        onChange={set("name")}
        className={fieldClass}
      />
      <input
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={values.email}
        onChange={set("email")}
        className={fieldClass}
      />
      <textarea
        placeholder="Message"
        rows={5}
        value={values.message}
        onChange={set("message")}
        className={`${fieldClass} resize-none`}
      />
      <div className="flex items-center justify-end gap-4 pt-2">
        {status === "error" && (
          <p className="text-sm text-ink-muted">Couldn&apos;t send — try again.</p>
        )}
        <button
          onClick={submit}
          disabled={status === "sending" || status === "sent"}
          className="rounded-full bg-accent px-8 py-4 text-[17px] text-white transition-opacity disabled:opacity-60"
        >
          {status === "sent" ? "Sent" : status === "sending" ? "Sending…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
