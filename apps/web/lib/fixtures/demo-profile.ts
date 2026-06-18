import type { Profile } from "@portfolio/schema";

/**
 * Demo fixture mirroring the Figma frames (Erica Bonifacio, Art
 * Director). Unsplash stand-ins until image storage exists.
 */
export const demoProfile: Profile = {
  username: "erica",
  displayName: "Erica Bonifacio",
  role: "Art Director",
  hero: { src: "/hero-portrait.png", width: 1600, height: 1500, alt: "Portrait of Erica Bonifacio" },
  biography:
    "Erica works at the intersection of fashion and image-making. Since 2014 she has directed campaigns and editorials across Europe, with a focus on quiet, deliberate photography built around available light.\n\nHer work has appeared in independent publications and gallery shows in Antwerp, Berlin and London.",
  experience: [
    { id: "e1", period: "2013 – 2014", title: "Parsons School of Design", subtitle: "Fashion Degree" },
    { id: "e2", period: "2009 – 2013", title: "Antwerp Fashion Institute", subtitle: "Masters in Sewing and Physiology" },
    { id: "e3", period: "2009 – 2013", title: "Berlin Biennale", subtitle: "Solo Exhibition" },
  ],
  contactEnabled: true,
  social: [
    { label: "Instagram", url: "https://instagram.com/example" },
    { label: "X", url: "https://x.com/example" },
    { label: "YouTube", url: "https://youtube.com/@example" },
  ],
  updatedAt: new Date().toISOString(),
  projects: [
    {
      slug: "gates-of-eternity",
      title: "Gates of Eternity",
      subtitle: "Oblivion is Nigh My Friend",
      year: 2026,
      cover: { src: "/project-1.jpg", width: 1600, height: 2000, alt: "Figure in shadow" },
      blocks: [
        {
          id: "p1b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "Shot over three days on the coast near Playa del Carmen, this series studies the body as architecture — thresholds, gates, the line where shadow becomes structure.",
          },
        },
        {
          id: "p1b2",
          type: "media-swipe",
          data: {
            images: [
              { src: "/swipe-1.jpg", width: 1224, height: 816, alt: "Two models on grass" },
              { src: "/swipe-2.png", width: 960, height: 1200, alt: "Model on stacked chair at beach" },
              { src: "/swipe-3.jpg", width: 960, height: 1200, alt: "Model in grey sweater on leather chair" },
            ],
          },
        },
        {
          id: "p1b3",
          type: "quote",
          data: { text: "No great mind has ever existed without a touch of madness." },
        },
        {
          id: "p1b2c",
          type: "media-carousel",
          data: {
            caption: "Playa del Carmen 2026",
            images: [
              { src: "/project-1.jpg", width: 1600, height: 2000, alt: "Figure in shadow" },
              { src: "/project-2.jpg", width: 1600, height: 1200, alt: "Sea, summer campaign" },
              { src: "/project-3.jpg", width: 1600, height: 1300, alt: "Studio with exercise ball" },
            ],
          },
        },
        {
          id: "p1b4",
          type: "story",
          data: {
            heading: "The Story",
            text: "The second movement of the series turns toward interiors — gymnasium light, found objects, the absurd weight of an exercise ball held like a relic.",
          },
        },
        {
          id: "p1b5",
          type: "photo",
          data: { src: "/photo-beach-1.jpg", width: 960, height: 1200, alt: "Model on beach with lemon" },
        },
        {
          id: "p1b6",
          type: "photo",
          data: { src: "/photo-beach-2.jpg", width: 960, height: 1200, alt: "Model on rocks with paddle" },
        },
        {
          id: "p1b7",
          type: "links",
          data: {
            heading: "Links",
            links: [
              { label: "Théâtre de L'alma", url: "https://example.com/theatre" },
              { label: "Biennale de Venise", url: "https://example.com/biennale" },
              { label: "SXSW 2027", url: "https://example.com/sxsw" },
            ],
          },
        },
      ],
    },
    {
      slug: "the-portal-of-joy",
      title: "The Portal of Joy",
      year: 2025,
      cover: { src: "/project-2.jpg", width: 1600, height: 1200, alt: "Sea, summer campaign" },
      blocks: [
        {
          id: "p2b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "A summer campaign shot at sea — saturated colour, hard sun, and a deliberately unserious mood.",
          },
        },
        {
          id: "p2b2",
          type: "media-swipe",
          data: {
            images: [
              { src: "/project-2.jpg", width: 1600, height: 1200, alt: "Sea, summer campaign" },
              { src: "/project-3.jpg", width: 1600, height: 1300, alt: "Studio with exercise ball" },
            ],
          },
        },
        {
          id: "p2b2c",
          type: "media-carousel",
          data: {
            caption: "Federica 2025",
            images: [
              { src: "/project-2.jpg", width: 1600, height: 1200, alt: "Sea, summer campaign" },
              { src: "/project-3.jpg", width: 1600, height: 1300, alt: "Studio with exercise ball" },
            ],
          },
        },
      ],
    },
    {
      slug: "summer-reverie",
      title: "Summer Reverie",
      year: 2025,
      cover: { src: "/project-4.jpg", width: 1440, height: 1800, alt: "Model reclining on a rocky beach at dusk" },
      blocks: [
        {
          id: "p4b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "Shot at golden hour on a rocky coastline — stillness, citrus, and the particular blue of late summer light.",
          },
        },
      ],
    },
    {
      slug: "discovering-bliss",
      title: "Discovering Bliss",
      year: 2024,
      cover: { src: "/project-3.jpg", width: 1600, height: 1300, alt: "Studio with exercise ball" },
      blocks: [
        {
          id: "p3b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "Wellness, examined sideways. Shot in a single afternoon in an empty office block.",
          },
        },
      ],
    },
    {
      slug: "shore-light",
      title: "Shore Light",
      year: 2024,
      cover: { src: "/project-5.jpg", width: 1440, height: 1800, alt: "Model with paddle racket against sparkling water" },
      blocks: [
        {
          id: "p5b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "Light as subject — the sun hitting the sea surface, the body caught between motion and stillness.",
          },
        },
      ],
    },
    {
      slug: "parallel",
      title: "Parallel",
      year: 2023,
      cover: { src: "/project-6.png", width: 1714, height: 1368, alt: "Two models on grass" },
      blocks: [
        {
          id: "p6b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "A study in doubles — two figures, one frame, the quiet tension of proximity.",
          },
        },
      ],
    },
    {
      slug: "sediment",
      title: "Sediment",
      year: 2023,
      cover: { src: "/project-7.jpg", width: 1080, height: 1350, alt: "Model in grey sweater on leather sofa" },
      blocks: [
        {
          id: "p7b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "Interior light, interior mood. Shot in a single room with no additional lighting.",
          },
        },
      ],
    },
    {
      slug: "elevation",
      title: "Elevation",
      year: 2022,
      cover: { src: "/project-8.jpg", width: 1080, height: 1350, alt: "Model on stacked chairs on a misty beach" },
      blocks: [
        {
          id: "p8b1",
          type: "story",
          data: {
            heading: "The Story",
            text: "Height as metaphor. An object placed wrong, a figure placed right, and the horizon doing everything else.",
          },
        },
      ],
    },
  ],
};
