import { Link } from "next-view-transitions";
import type { Project } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { FadeImage } from "@/components/ui/FadeImage";
import { FadeVideo } from "@/components/ui/FadeVideo";
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
    <Link href={`/${username}/${project.slug}`} className="group block">
      <Card className="relative">
        {project.coverVideo ? (
          <FadeVideo
            src={project.coverVideo.src}
            poster={project.coverVideo.poster ?? project.cover.src}
            width={project.coverVideo.width ?? project.cover.width}
            height={project.coverVideo.height ?? project.cover.height}
            autoPlay
            muted
            loop
            playsInline
            className="w-full"
          />
        ) : (
          <FadeImage
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 220px, (min-width: 600px) 600px, 100vw"
            className="w-full object-cover"
          />
        )}
        <GlassPill className="absolute inset-x-3 bottom-3 flex items-center justify-between px-5 py-4 transition-[transform,opacity] duration-300 ease-out [@media(hover:hover)]:translate-y-[calc(100%+12px)] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          <span className="text-lg">{project.title}</span>
          <span className="text-sm text-ink-muted">See more</span>
        </GlassPill>
      </Card>
    </Link>
  );
}
