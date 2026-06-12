import { ProfileSchema, type Profile, type Project } from "@portfolio/schema";
import { demoProfile } from "./fixtures/demo-profile";

/*
 * Data access — fixture-backed for now. Becomes a fetch to the API /
 * Supabase later; routes and components don't change. Keep the
 * .parse(): the renderer never receives a shape the schema didn't bless.
 */

export async function getProfile(username: string): Promise<Profile | null> {
  if (username !== demoProfile.username) return null;
  return ProfileSchema.parse(demoProfile);
}

export async function getProject(
  username: string,
  slug: string
): Promise<{ profile: Profile; project: Project } | null> {
  const profile = await getProfile(username);
  if (!profile) return null;
  const project = profile.projects.find((p) => p.slug === slug);
  if (!project) return null;
  return { profile, project };
}

export async function listPublishedUsernames(): Promise<string[]> {
  return [demoProfile.username];
}
