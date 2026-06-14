import type { ProjectBlock } from "@portfolio/schema";
import { StoryCard } from "./StoryCard";
import { SwipeCard } from "./SwipeCard";
import { SwiperCarousel } from "./SwiperCarousel";
import { QuoteBlock } from "./QuoteBlock";
import { LinksCard } from "./LinksCard";
import { VideoCard } from "./VideoCard";
import { PhotoCard } from "./PhotoCard";

/** Exhaustive switch — a schema block type without a renderer is a compile error. */
export function ProjectBlockRenderer({ block }: { block: ProjectBlock }) {
  switch (block.type) {
    case "story":
      return <StoryCard data={block.data} />;
    case "media-swipe":
      return <SwipeCard data={block.data} />;
    case "media-carousel":
      return <SwiperCarousel data={block.data} />;
    case "quote":
      return <QuoteBlock data={block.data} />;
    case "links":
      return <LinksCard data={block.data} />;
    case "video":
      return <VideoCard data={block.data} />;
    case "photo":
      return <PhotoCard data={block.data} />;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
