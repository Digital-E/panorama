import { Link } from "next-view-transitions";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="text-lg">This page doesn&apos;t exist.</p>
      <Link href="/" className="text-ink-muted underline underline-offset-4">
        Go home
      </Link>
    </main>
  );
}
