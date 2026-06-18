import Link from "next/link";
import type { Project } from "@portfolio/schema";
import { FadeImage } from "@/components/ui/FadeImage";

export function ListProjectCard({
  username,
  project,
  rounded = false,
  thumbnail = true,
}: {
  username: string;
  project: Project;
  rounded?: boolean;
  thumbnail?: boolean;
}) {
  return (
    <Link
      href={`/${username}/${project.slug}`}
      className="group flex items-center gap-4 py-3 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
    >
      {thumbnail && (
        rounded ? (
          <div className="shrink-0 w-10 h-10 overflow-hidden">
            <FadeImage
              src={project.cover.src}
              alt={project.cover.alt}
              width={project.cover.width}
              height={project.cover.height}
              sizes="40px"
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
            />
          </div>
        ) : (
          <div className="shrink-0 w-10 h-10 flex items-center justify-center">
            <div
              className="overflow-hidden"
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
                sizes="40px"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
              />
            </div>
          </div>
        )
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">{project.title}</p>
        {project.subtitle && (
          <p className="text-xs text-ink-muted truncate mt-0.5">{project.subtitle}</p>
        )}
      </div>
      {project.year && (
        <span className="shrink-0 text-xs text-ink-muted">{project.year}</span>
      )}
    </Link>
  );
}
