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
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path
        d="M8.46875 0.5H11.75V3.78125M11.0469 1.20312L7.53125 4.71875M6.125 1.4375H1.90625C1.53329 1.4375 1.1756 1.58566 0.911881 1.84938C0.648158 2.1131 0.5 2.47079 0.5 2.84375V10.3438C0.5 10.7167 0.648158 11.0744 0.911881 11.3381C1.1756 11.6018 1.53329 11.75 1.90625 11.75H9.40625C9.77921 11.75 10.1369 11.6018 10.4006 11.3381C10.6643 11.0744 10.8125 10.7167 10.8125 10.3438V6.125"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
