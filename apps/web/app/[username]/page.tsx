import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESERVED_USERNAMES } from "@portfolio/schema";
import { getProfile, listPublishedUsernames } from "@/lib/data";
import { HomeMenu } from "@/components/home/HomeMenu";
import { HeroCard } from "@/components/home/HeroCard";
import { SectionsNav } from "@/components/home/SectionsNav";
import { ProjectCard } from "@/components/home/ProjectCard";
import { FooterCard } from "@/components/home/FooterCard";

/*
 * Profile home — ISR. Pages regenerate on demand when the owner
 * publishes (API calls revalidatePath(`/${username}`)); the hourly
 * fallback is a safety net.
 */
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
    title: profile.displayName,
    description: profile.role
      ? `${profile.displayName} — ${profile.role}`
      : `${profile.displayName}'s portfolio`,
    openGraph: { title: profile.displayName, type: "profile" },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  if (RESERVED_USERNAMES.has(username)) notFound();

  const profile = await getProfile(username);
  if (!profile) notFound();

  return (
    <>
      <HomeMenu profile={profile} />
      <main className="flex flex-col gap-(--spacing-gutter) p-(--spacing-gutter)">
        <div className="flex flex-col gap-(--spacing-gutter) md:hidden">
          <HeroCard profile={profile} />
          <SectionsNav profile={profile} />
        </div>
        <div
          id="work"
          className="scroll-mt-3 columns-1 gap-(--spacing-gutter) md:columns-2 lg:columns-3"
        >
          {profile.projects.map((project) => (
            <ProjectCard key={project.slug} username={profile.username} project={project} />
          ))}
        </div>
        <FooterCard profile={profile} />
      </main>
    </>
  );
}
