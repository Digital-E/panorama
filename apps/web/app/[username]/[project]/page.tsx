import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProject, listPublishedUsernames, getProfile } from "@/lib/data";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { extractProjectImages } from "@/lib/extractProjectImages";
import { HomeMenu } from "@/components/home/HomeMenu";
import { MobileProjectGrid } from "@/components/project/MobileProjectGrid";
import { ProjectInfoButton } from "@/components/project/ProjectInfoButton";

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

type Props = {
  params: Promise<{ username: string; project: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, project: slug } = await params;
  const result = await getProject(username, slug);
  if (!result) return {};
  return {
    title: `${result.project.title} — ${result.profile.displayName}`,
    description: result.project.subtitle,
  };
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const { username, project: slug } = await params;
  const { from } = await searchParams;
  const result = await getProject(username, slug);
  if (!result) notFound();
  const { profile, project } = result;

  const backHref = from === "work" ? `/${profile.username}/work` : `/${profile.username}`;
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

        <main className="flex flex-col gap-(--spacing-gutter) px-(--spacing-gutter-x) py-(--spacing-gutter) pt-5 md:pl-[250px] md:pr-[150px]">
          <ProjectGallery images={galleryImages} title={project.title} year={project.year} />
        </main>
      </div>

      {/* ── Mobile — image grid ── */}
      <div data-page="project" className="md:hidden min-h-dvh">
        <header className="sticky top-0 z-50 px-[10px] pt-[20px] pb-[10px]">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 backdrop-blur-[3px]" style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 100%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 100%)" }} />
            <div className="absolute inset-0 backdrop-blur-[8px]" style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 60%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 60%)" }} />
            <div className="absolute inset-0 backdrop-blur-[16px]" style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 30%)", maskImage: "linear-gradient(to bottom, #000 0%, transparent 30%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-canvas) 0%, transparent 100%)" }} />
          </div>
          <div className="relative flex h-12 items-center justify-center">
            <div className="absolute left-0">
              <Link
                href={backHref}
                aria-label="Back to home"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-glass text-ink backdrop-blur-md"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="text-center leading-tight">
              <p className="font-semibold">{project.title}</p>
              <p className="text-sm text-ink-muted">{project.year}</p>
            </div>
            <div className="absolute right-0">
              <ProjectInfoButton project={project} />
            </div>
          </div>
        </header>

        <MobileProjectGrid images={galleryImages} />
      </div>
    </>
  );
}
