import { Link } from "next-view-transitions";
import type { Project } from "@portfolio/schema";
import { FadeImage } from "@/components/ui/FadeImage";
import { FadeVideo } from "@/components/ui/FadeVideo";

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
      className="group flex items-center gap-4 px-3 py-3 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
    >
      {thumbnail && (
        rounded ? (
          <div className="shrink-0 w-10 h-10 overflow-hidden rounded-[3px]">
            {project.coverVideo ? (
              <FadeVideo src={project.coverVideo.src} poster={project.coverVideo.poster ?? project.cover.src} autoPlay muted loop playsInline className="max-w-full max-h-full transition-opacity duration-300 group-hover:opacity-70" />
            ) : (
              <FadeImage
                src={project.cover.src}
                alt={project.cover.alt}
                width={project.cover.width}
                height={project.cover.height}
                sizes="40px"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
              />
            )}
          </div>
        ) : (
          <div className="shrink-0 w-10 h-10 flex items-center justify-center">
            {project.coverVideo ? (
              <FadeVideo src={project.coverVideo.src} poster={project.coverVideo.poster ?? project.cover.src} autoPlay muted loop playsInline className={`max-w-full max-h-full rounded-[3px] transition-opacity duration-300 group-hover:opacity-70`} />
            ) : (
              <div
                className="overflow-hidden rounded-[3px]"
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
            )}
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
