import type { z } from "zod";
import type { LinksBlockSchema } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";

type Data = z.infer<typeof LinksBlockSchema>["data"];

export function LinksCard({ data }: { data: Data }) {
  return (
    <Card className="px-6 py-6">
      <h2 className="text-ink-muted">{data.heading}</h2>
      <ul className="mt-3 space-y-2.5">
        {data.links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-ink-muted"
            >
              {link.label}
              <ExternalIcon />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M5.5 3H3.5A1.5 1.5 0 002 4.5v6A1.5 1.5 0 003.5 12h6A1.5 1.5 0 0011 10.5V8.5M8 2h4v4M12 2L6.5 7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
