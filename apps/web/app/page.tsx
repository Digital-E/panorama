import Link from "next/link";

// Marketing page — out of scope. The demo profile is the build target.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-medium">Panorama</h1>
      <Link href="/erica" className="text-ink-muted underline underline-offset-4">
        View demo profile →
      </Link>
    </main>
  );
}
