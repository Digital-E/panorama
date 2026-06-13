import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, listPublishedUsernames, getProfile } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { ProjectBlockRenderer } from "@/components/project/ProjectBlockRenderer";
import { SwipeCard } from "@/components/project/SwipeCard";
import { MediaCarousel } from "@/components/project/MediaCarousel";
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
            pendingCarousel = <MediaCarousel key={`${block.id}-carousel`} data={block.data} />;
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
