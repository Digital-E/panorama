import Link from "next/link";
import type { Project } from "@portfolio/schema";
import { FadeImage } from "@/components/ui/FadeImage";
import { FadeVideo } from "@/components/ui/FadeVideo";

export function ArchiveProjectCard({
  username,
  project,
  rounded = true,
  showTitle = false,
}: {
  username: string;
  project: Project;
  rounded?: boolean;
  showTitle?: boolean;
}) {
  return (
    <Link
      href={`/${username}/${project.slug}`}
      className="group relative aspect-square flex items-center justify-center md:p-5 rounded-2xl transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
    >
      {project.coverVideo ? (
        <FadeVideo
          src={project.coverVideo.src}
          poster={project.cover.src}
          autoPlay
          muted
          loop
          playsInline
          className={`max-w-full max-h-full ${rounded ? "rounded-xl" : ""}`}
        />
      ) : (
        <div
          className={`${rounded ? "rounded-xl" : ""} overflow-hidden`}
          style={{
            aspectRatio: `${project.cover.width} / ${project.cover.height}`,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <FadeImage
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 1280px) 220px, (min-width: 1024px) 200px, 200px"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {showTitle && (
        <div className="pointer-events-none absolute top-full left-0 right-0 pt-1.5 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs text-ink truncate leading-tight">{project.title}</p>
          {project.year && (
            <p className="text-xs text-ink-muted">{project.year}</p>
          )}
        </div>
      )}
    </Link>
  );
}
