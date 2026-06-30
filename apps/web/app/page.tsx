import { Link } from "next-view-transitions";
import { listProfiles } from "@/lib/data";

export default async function Home() {
  const profiles = await listProfiles();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-medium mb-6">Panorama</h1>
      {profiles.map((p) => (
        <Link
          key={p.username}
          href={`/${p.username}`}
          className="flex items-baseline gap-3 hover:text-ink-muted transition-colors"
        >
          <span className="text-base">{p.displayName}</span>
          <span className="text-sm text-ink-muted">{p.role}</span>
        </Link>
      ))}
    </main>
  );
}
