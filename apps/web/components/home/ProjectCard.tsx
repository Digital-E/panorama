import Image from "next/image";
import Link from "next/link";
import type { Project } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { GlassPill } from "@/components/ui/GlassPill";

/** Cover image card with a floating glass title bar, links to the project page. */
export function ProjectCard({
  username,
  project,
}: {
  username: string;
  project: Project;
}) {
  return (
    <Link href={`/${username}/${project.slug}`} className="block">
      <Card className="relative">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          sizes="(min-width: 600px) 600px, 100vw"
          className="aspect-square w-full object-cover"
        />
        <GlassPill className="absolute inset-x-3 bottom-3 flex items-center justify-between px-5 py-4">
          <span className="text-lg">{project.title}</span>
          <span className="text-sm text-ink-muted">See more</span>
        </GlassPill>
      </Card>
    </Link>
  );
}
