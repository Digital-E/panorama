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
  const [attempted, setAttempted] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const valid = {
    name: values.name.trim().length > 0,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email),
    message: values.message.trim().length > 0,
  };

  async function submit() {
    setAttempted(true);
    if (!valid.name || !valid.email || !valid.message) return;
    setStatus("sending");
    // TODO: remove before launch
    await new Promise((r) => setTimeout(r, 2000));
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

  const fieldClass = (isValid: boolean) =>
    "peer w-full rounded-(--radius-field) px-6 pt-7 pb-3 placeholder:opacity-0 focus:outline-none " +
    (attempted && !isValid
      ? "bg-red-950/40 ring-1 ring-red-500 focus-visible:outline-2 focus-visible:outline-red-500"
      : "bg-field focus-visible:outline-2 focus-visible:outline-accent");

  const labelClass = (isValid: boolean) =>
    "pointer-events-none absolute left-6 top-3.5 text-xs transition-all duration-200 " +
    "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base " +
    "peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs " +
    (attempted && !isValid ? "text-red-400" : "text-ink/50");

  const textareaLabelClass = (isValid: boolean) =>
    "pointer-events-none absolute left-6 top-3.5 text-xs transition-all duration-200 " +
    "peer-placeholder-shown:top-7 peer-placeholder-shown:text-base " +
    "peer-focus:top-3.5 peer-focus:text-xs " +
    (attempted && !isValid ? "text-red-400" : "text-ink/50");

  return (
    <div className="space-y-4">
      <div className="relative">
        <input type="text" id="f-name" placeholder=" " autoComplete="name"
          value={values.name} onChange={set("name")} className={fieldClass(valid.name)} />
        <label htmlFor="f-name" className={labelClass(valid.name)}>Name</label>
      </div>

      <div className="relative">
        <input type="email" id="f-email" placeholder=" " autoComplete="email"
          value={values.email} onChange={set("email")} className={fieldClass(valid.email)} />
        <label htmlFor="f-email" className={labelClass(valid.email)}>Email</label>
      </div>

      <div className="relative">
        <textarea id="f-message" placeholder=" " rows={5}
          value={values.message} onChange={set("message")}
          className={`${fieldClass(valid.message)} resize-none`} />
        <label htmlFor="f-message" className={textareaLabelClass(valid.message)}>Message</label>
      </div>

      <div className="flex items-center justify-end gap-4 pt-2">
        {status === "error" && (
          <p className="text-sm text-ink-muted">Couldn&apos;t send — try again.</p>
        )}
        <button
          onClick={submit}
          disabled={status === "sending" || status === "sent"}
          className="flex min-w-[100px] items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-white transition-opacity disabled:opacity-60"
        >
          {status === "sending" && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
              <path fill="currentColor" className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {status === "sent" ? "Sent" : status === "sending" ? "Sending…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
