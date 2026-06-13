import type { z } from "zod";
import type { StoryBlockSchema } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";

type Data = z.infer<typeof StoryBlockSchema>["data"];

export function StoryCard({ data }: { data: Data }) {
  return (
    <Card className="px-6 py-6">
      <h2 className="leading-none text-ink/90">{data.heading}</h2>
      <div className="mt-2 space-y-4 text-ink-muted">
        {data.text.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </Card>
  );
}
