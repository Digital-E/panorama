import { ProfileSchema, type Profile, type Project } from "@portfolio/schema";
import { demoProfile } from "./fixtures/demo-profile";
import { gerayMenaProfile } from "./fixtures/geray-mena-profile";
import { winterProfile } from "./fixtures/winter-profile";

/*
 * Data access — fixture-backed for now. Becomes a fetch to the API /
 * Supabase later; routes and components don't change. Keep the
 * .parse(): the renderer never receives a shape the schema didn't bless.
 */

const FIXTURES = [demoProfile, winterProfile, gerayMenaProfile];
const fixtureMap = new Map(FIXTURES.map((p) => [p.username, p]));

export async function getProfile(username: string): Promise<Profile | null> {
  const fixture = fixtureMap.get(username);
  if (!fixture) return null;
  return ProfileSchema.parse(fixture);
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
  return FIXTURES.map((p) => p.username);
}

export async function listProfiles(): Promise<{ username: string; displayName: string; role?: string }[]> {
  return FIXTURES.map((p) => ({ username: p.username, displayName: p.displayName, role: p.role }));
}
