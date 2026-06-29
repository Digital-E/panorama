import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RESERVED_USERNAMES } from "@portfolio/schema";
import { getProfile, listPublishedUsernames } from "@/lib/data";
import { FadeImage } from "@/components/ui/FadeImage";
import { Card } from "@/components/ui/Card";
import { FooterCard } from "@/components/home/FooterCard";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const usernames = await listPublishedUsernames();
  return usernames.map((username) => ({ username }));
}

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return {};
  return {
    title: `Work — ${profile.displayName}`,
  };
}

export default async function WorkPage({ params }: Props) {
  const { username } = await params;
  if (RESERVED_USERNAMES.has(username)) notFound();

  const profile = await getProfile(username);
  if (!profile) notFound();

  const backHref = `/${profile.username}`;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 px-(--spacing-gutter-x) pt-(--spacing-gutter)">
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
          <p className="font-semibold">Work</p>
        </div>
      </header>

      <main className="flex flex-col gap-(--spacing-gutter) px-(--spacing-gutter-x) py-[10px]">
        {profile.projects.length > 0 && (
          <Card>
            <ul>
              {profile.projects.map((project, i) => (
                <li key={project.slug}>
                  {i > 0 && <div className="mx-6 h-px bg-surface-edge" />}
                  <Link
                    href={`/${profile.username}/${project.slug}?from=work`}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0 w-8 h-8 overflow-hidden rounded-[6px]">
                        <FadeImage
                          src={project.cover.src}
                          alt={project.cover.alt}
                          width={project.cover.width}
                          height={project.cover.height}
                          sizes="56px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-lg truncate">{project.title}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 ml-2">
                      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <FooterCard profile={profile} />

        <img
          src="/Panorama-logo-1.svg"
          alt="Panorama"
          className="w-full my-[10px] px-[10px]"
        />
      </main>
    </div>
  );
}
