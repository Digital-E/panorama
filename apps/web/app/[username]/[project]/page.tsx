import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, listPublishedUsernames, getProfile } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { ProjectBlockRenderer } from "@/components/project/ProjectBlockRenderer";

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
    <main className="mx-auto flex w-full max-w-(--container-column) flex-col gap-(--spacing-gutter) p-(--spacing-gutter)">
      <nav>
        <Link
          href={`/${profile.username}`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {profile.displayName}
        </Link>
      </nav>

      <Card className="px-6 py-5">
        <h1 className="text-lg">{project.title}</h1>
        {project.subtitle && (
          <p className="mt-0.5 text-lg text-ink-muted">{project.subtitle}</p>
        )}
      </Card>

      {project.blocks.map((block) => (
        <ProjectBlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
