import type { ImageAsset, ProjectBlock } from "@portfolio/schema";

export function extractProjectImages(
  cover: ImageAsset,
  blocks: ProjectBlock[],
): ImageAsset[] {
  const images: ImageAsset[] = [cover];
  for (const block of blocks) {
    if (block.type === "photo") {
      images.push(block.data);
    } else if (block.type === "media-swipe" || block.type === "media-carousel") {
      images.push(...block.data.images);
    }
  }
  return images;
}
