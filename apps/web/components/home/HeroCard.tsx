import Image from "next/image";
import type { Profile } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";

/** Rounded hero card — name and role overlaid bottom-left. */
export function HeroCard({ profile }: { profile: Profile }) {
  return (
    <Card className="relative aspect-[16/15]">
      <Image
        src={profile.hero.src}
        alt={profile.hero.alt}
        fill
        priority
        sizes="(min-width: 600px) 600px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />
      <header className="absolute inset-x-0 bottom-0 p-6">
        <h1 className="text-2xl leading-tight">{profile.displayName}</h1>
        {profile.role && <p className="mt-0.5 text-[18px] text-white/70">{profile.role}</p>}
      </header>
    </Card>
  );
}
