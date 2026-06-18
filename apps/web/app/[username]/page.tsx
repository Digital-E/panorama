import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESERVED_USERNAMES } from "@portfolio/schema";
import { getProfile, listPublishedUsernames } from "@/lib/data";
import { HomeMenu } from "@/components/home/HomeMenu";
import { HeroCard } from "@/components/home/HeroCard";
import { SectionsNav } from "@/components/home/SectionsNav";
import { ProjectsGrid } from "@/components/home/ProjectsGrid";
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
      <main className="flex flex-col gap-(--spacing-gutter) p-(--spacing-gutter) pt-5 md:pl-[250px] md:pr-[150px]">
        <div className="flex flex-col gap-(--spacing-gutter) md:hidden">
          <HeroCard profile={profile} />
          <SectionsNav profile={profile} />
        </div>
        <ProjectsGrid
          username={profile.username}
          projects={[
            ...profile.projects,
            ...profile.projects.map((p) => ({ ...p, slug: `${p.slug}-b` })),
            ...profile.projects.map((p) => ({ ...p, slug: `${p.slug}-c` })),
            ...profile.projects.map((p) => ({ ...p, slug: `${p.slug}-d` })),
          ]}
        />
        <FooterCard profile={profile} />
      </main>
    </>
  );
}
