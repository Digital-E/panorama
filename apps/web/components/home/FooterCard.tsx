import type { Profile } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";
import { SocialIcon } from "./SocialIcon";

/** Legal links, social icons, platform credit. */
export function FooterCard({ profile }: { profile: Profile }) {
  return (
    <Card className="px-6 py-6">
      <h2 className="text-sm text-ink-muted">Legal</h2>
      <ul className="mt-3 space-y-1.5 text-[15px] leading-none">
        <li><a href="/legal" className="hover:text-ink-muted">Legal Notice</a></li>
        <li><a href="/privacy" className="hover:text-ink-muted">Privacy Policy</a></li>
      </ul>

      {profile.social.length > 0 && (
        <ul className="mt-12 flex items-center gap-5">
          {profile.social.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <SocialIcon label={link.label} />
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 h-px bg-surface-edge" />
      <p className="mt-5 text-sm text-ink-muted">
        Created with <span className="text-ink">Panorama</span>
      </p>
    </Card>
  );
}
