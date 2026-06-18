import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, listPublishedUsernames, getProfile } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { ProjectBlockRenderer } from "@/components/project/ProjectBlockRenderer";
import { ProfileCapsule } from "@/components/project/ProfileCapsule";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { extractProjectImages } from "@/lib/extractProjectImages";
import { HomeMenu } from "@/components/home/HomeMenu";

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

const BackArrow = ({ href }: { href: string }) => (
  <Link
    href={href}
    aria-label="Back to home"
    className="flex h-10 w-10 items-center justify-center rounded-full bg-glass text-ink backdrop-blur-md"
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
);

export default async function ProjectPage({ params }: Props) {
  const { username, project: slug } = await params;
  const result = await getProject(username, slug);
  if (!result) notFound();
  const { profile, project } = result;

  const backHref = `/${profile.username}`;
  const galleryImages = extractProjectImages(project.cover, project.blocks);

  return (
    <>
      {/* ── Desktop — matches home layout ── */}
      <div className="hidden md:block">
        <HomeMenu profile={profile} />

        {/* Back button — fixed left column, below dots */}
        <div className="fixed left-3 top-[108px] z-40 px-3">
          <Link
            href={backHref}
            aria-label="Back to home"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-muted hover:text-ink transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M9 3L4.5 7.5L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <main className="flex flex-col gap-(--spacing-gutter) p-(--spacing-gutter) pt-5 md:pl-[250px] md:pr-[150px]">
          <ProjectGallery images={galleryImages} title={project.title} year={project.year} />
        </main>
      </div>

      {/* ── Mobile — blocks layout ── */}
      <div data-page="project" className="md:hidden min-h-dvh bg-(--color-canvas)">
        <div className="flex flex-col gap-(--spacing-gutter) p-(--spacing-gutter)">

          {/* Mobile sticky header */}
          <header className="sticky top-0 z-50 -mx-(--spacing-gutter) -mt-(--spacing-gutter) px-(--spacing-gutter) pt-(--spacing-gutter)">
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
              <div className="absolute left-0">
                <BackArrow href={backHref} />
              </div>
              <div className="text-center leading-tight">
                <p className="font-semibold">Work</p>
                <p className="text-sm text-ink">{profile.displayName}</p>
              </div>
            </div>
          </header>

          {/* Title card */}
          <Card className="px-6 py-5">
            <h1 className="text-lg">{project.title}</h1>
            {project.subtitle && (
              <p className="mt-0.5 text-lg text-ink-muted">{project.subtitle}</p>
            )}
          </Card>

          {/* Blocks */}
          {project.blocks.map((block) => (
            <ProjectBlockRenderer key={block.id} block={block} />
          ))}

          <ProfileCapsule
            href={backHref}
            displayName={profile.displayName}
            heroSrc={profile.hero.src}
            heroAlt={profile.hero.alt}
          />
        </div>
      </div>
    </>
  );
}
