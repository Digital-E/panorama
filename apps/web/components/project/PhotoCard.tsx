import Image from "next/image";
import type { ImageAsset } from "@portfolio/schema";

export function PhotoCard({ data }: { data: ImageAsset }) {
  return (
    <div className="w-full overflow-hidden rounded-(--radius-card)">
      <Image
        src={data.src}
        alt={data.alt}
        width={data.width}
        height={data.height}
        draggable={false}
        sizes="(min-width: 600px) 600px, 100vw"
        className="w-full object-cover"
      />
    </div>
  );
}
