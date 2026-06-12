import { NextResponse } from "next/server";
import { ContactMessageSchema } from "@portfolio/schema";

/**
 * Contact form endpoint — STUB. Validates and accepts; delivery (email
 * to the profile owner, persistence, rate limiting, spam protection)
 * comes with the real backend.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 422 });
  }

  // TODO: deliver to profile owner (email/queue) once backend exists.
  console.log("[contact]", parsed.data.toUsername, parsed.data.email);

  return NextResponse.json({ ok: true });
}
