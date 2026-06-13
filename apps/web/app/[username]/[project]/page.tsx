import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, listPublishedUsernames, getProfile } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { ProjectBlockRenderer } from "@/components/project/ProjectBlockRenderer";
import { SwipeCard } from "@/components/project/SwipeCard";
import { MediaCarousel } from "@/components/project/MediaCarousel";
import { SwiperCarousel } from "@/components/project/SwiperCarousel";
import { ProfileCapsule } from "@/components/project/ProfileCapsule";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const usernames = await listPublishedUsernames();
  const params: { username: string; project: string }[] = [];
  for (const username of usernames) {
    const profile = await getProfile(username);
    for (const project of profile?.projects ?? []) {
      params.push({ username, project: project.slug });
    }
  }
  return params;
}

type Props = { params: Promise<{ username: string; project: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, project: slug } = await params;
  const result = await getProject(username, slug);
  if (!result) return {};
  return {
    title: `${result.project.title} — ${result.profile.displayName}`,
    description: result.project.subtitle,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { username, project: slug } = await params;
  const result = await getProject(username, slug);
  if (!result) notFound();
  const { profile, project } = result;

  return (
    <main data-page="project" className="mx-auto flex min-h-dvh w-full max-w-(--container-column) flex-col gap-(--spacing-gutter) bg-(--color-canvas) p-(--spacing-gutter)">
      <header className="sticky top-0 z-50 -mx-(--spacing-gutter) -mt-(--spacing-gutter) px-(--spacing-gutter) pt-(--spacing-gutter)">
        {/* Progressive blur: stacked backdrop-blur layers, each masked to a
            different band, so blur is strongest at the top and gone at the
            bottom. A canvas tint fades out over the same range. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 backdrop-blur-[3px]"
            style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 100%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 100%)" }}
          />
          <div
            className="absolute inset-0 backdrop-blur-[8px]"
            style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 60%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 60%)" }}
          />
          <div
            className="absolute inset-0 backdrop-blur-[16px]"
            style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 30%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 30%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, var(--color-canvas) 0%, transparent 100%)" }}
          />
        </div>
        <div className="relative flex h-12 items-center justify-center">
          <Link
            href={`/${profile.username}`}
            aria-label="Back to home"
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-glass text-ink backdrop-blur-md"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="text-center leading-tight">
            <p className="font-semibold">Work</p>
            <p className="text-sm text-ink">{profile.displayName}</p>
          </div>
        </div>
      </header>

      <Card className="px-6 py-5">
        <h1 className="text-lg">{project.title}</h1>
        {project.subtitle && (
          <p className="mt-0.5 text-lg text-ink-muted">{project.subtitle}</p>
        )}
      </Card>

      {(() => {
        const elements: React.ReactNode[] = [];
        let pendingCarousel: React.ReactNode = null;
        for (const block of project.blocks) {
          if (block.type === "media") {
            if (pendingCarousel) { elements.push(pendingCarousel); pendingCarousel = null; }
            elements.push(<SwipeCard key={block.id} data={block.data} />);
            pendingCarousel = (
              <div key={`${block.id}-carousel`} className="flex flex-col gap-(--spacing-gutter)">
                <MediaCarousel data={block.data} />
                <SwiperCarousel data={block.data} />
              </div>
            );
          } else {
            elements.push(<ProjectBlockRenderer key={block.id} block={block} />);
            if (block.type === "quote" && pendingCarousel) {
              elements.push(pendingCarousel);
              pendingCarousel = null;
            }
          }
        }
        if (pendingCarousel) elements.push(pendingCarousel);
        return elements;
      })()}

      <ProfileCapsule
        href={`/${profile.username}`}
        displayName={profile.displayName}
        heroSrc={profile.hero.src}
        heroAlt={profile.hero.alt}
      />
    </main>
  );
}
