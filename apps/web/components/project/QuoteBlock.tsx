import type { z } from "zod";
import type { QuoteBlockSchema } from "@portfolio/schema";

type Data = z.infer<typeof QuoteBlockSchema>["data"];

/** Large centred pull quote, set directly on the canvas (no card). */
export function QuoteBlock({ data }: { data: Data }) {
  return (
    <blockquote className="px-4 py-10 text-center text-xl font-medium leading-tight tracking-normal">
      &ldquo;{data.text}&rdquo;
    </blockquote>
  );
}
