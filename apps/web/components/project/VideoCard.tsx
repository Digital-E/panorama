import type { z } from "zod";
import type { VideoBlockSchema } from "@portfolio/schema";
import { Card } from "@/components/ui/Card";

type Data = z.infer<typeof VideoBlockSchema>["data"];

/**
 * Native controls for v1. The frame shows custom chrome (play, scrubber,
 * volume, PiP) — worth building once video actually exists in the model.
 */
export function VideoCard({ data }: { data: Data }) {
  return (
    <Card>
      <video
        src={data.src}
        poster={data.poster?.src}
        controls
        playsInline
        className="h-auto w-full"
      />
    </Card>
  );
}
