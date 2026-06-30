import type { Profile } from "@portfolio/schema";

export const winterProfile: Profile = {
  username: "winter",
  displayName: "Winter Vandenbrink",
  role: "Photographer",
  hero: { src: "/winter/necklace-1.jpg", width: 1200, height: 1314, alt: "Four models in Moncler AW25, photographed by Winter Vandenbrink for AnOther Magazine" },
  biography:
    "Winter Vandenbrink is a photographer working across fashion editorial, advertising and portraiture. Based between Amsterdam and Paris, he shoots for international publications and brands with a directorial eye drawn to tension, movement and the unrepeatable moment.\n\nHis editorial work has appeared in Fantastic Man, AnOther Magazine and Selfservice. Brand clients include Another Magazine, Canada Goose, Prada, Zara, Uniqlo and Saint Laurent. Winter is represented by M.A.P.",
  experience: [
    { id: "w1", period: "2025", title: "AnOther Magazine — Issue 49", subtitle: "Cover shoot, Moncler AW25" },
    { id: "w2", period: "2025", title: "Fantastic Man — No. 41", subtitle: "Cover, with Sydney Rose Thomas" },
    { id: "w3", period: "2025", title: "Saint Laurent", subtitle: "Charlotte Gainsbourg & Dominic Fike portraits" },
  ],
  contactEnabled: true,
  social: [
    { label: "Instagram", url: "https://instagram.com/example" },
  ],
  updatedAt: new Date().toISOString(),
  projects: [
    {
      slug: "another-magazine",
      title: "AnOther Magazine",
      subtitle: "AW25 — Moncler with Agata Belcen",
      year: 2025,
      cover: { src: "/winter/moncler-1.jpg", width: 1200, height: 1314, alt: "Model in black Moncler crop top and sunglasses, field backdrop" },
      blocks: [
        {
          id: "am-b1",
          type: "photo",
          data: { src: "/winter/moncler-2.jpg", width: 1200, height: 1314, alt: "Two models in black Moncler outerwear moving through a field" },
        },
        {
          id: "am-b2",
          type: "photo",
          data: { src: "/winter/moncler-3.jpg", width: 1200, height: 1314, alt: "Close group of models in layered black Moncler" },
        },
        {
          id: "am-b3",
          type: "photo",
          data: { src: "/winter/moncler-4.jpg", width: 1200, height: 1314, alt: "Model in black Moncler puffer with oversized Moncler balaclava" },
        },
        {
          id: "am-b4",
          type: "photo",
          data: { src: "/winter/moncler-5.jpg", width: 1200, height: 1314, alt: "Close portrait, model in knit balaclava with mirrored ski goggles" },
        },
        {
          id: "am-b5",
          type: "photo",
          data: { src: "/winter/moncler-6.jpg", width: 1200, height: 1314, alt: "Model running in black Moncler puffer and cap" },
        },
        {
          id: "am-b6",
          type: "photo",
          data: { src: "/winter/moncler-7.jpg", width: 1200, height: 1314, alt: "Five models seated on a park bench in Moncler AW25" },
        },
        {
          id: "am-b7",
          type: "photo",
          data: { src: "/winter/moncler-8.jpg", width: 1200, height: 1314, alt: "Four models advancing through a field in black Moncler" },
        },
        {
          id: "am-b8",
          type: "photo",
          data: { src: "/winter/moncler-9.jpg", width: 1200, height: 1314, alt: "Close portrait, model in lacquered Moncler hood and baseball cap" },
        },
        {
          id: "am-b9",
          type: "photo",
          data: { src: "/winter/moncler-10.jpg", width: 1200, height: 1314, alt: "Three models in black Moncler coats in tall grass" },
        },
      ],
    },
    {
      slug: "wolves",
      title: "Wolves",
      subtitle: "AnOther Magazine",
      year: 2025,
      cover: { src: "/winter/wolves-1.jpg", width: 1200, height: 1500, alt: "Wolves editorial by Winter Vandenbrink for AnOther Magazine" },
      blocks: [
        {
          id: "wlv-b1",
          type: "photo",
          data: { src: "/winter/wolves-2.jpg", width: 1200, height: 1499, alt: "Wolves editorial, image 2" },
        },
        {
          id: "wlv-b2",
          type: "photo",
          data: { src: "/winter/wolves-3.jpg", width: 1200, height: 1500, alt: "Wolves editorial, image 3" },
        },
        {
          id: "wlv-b3",
          type: "photo",
          data: { src: "/winter/wolves-4.jpg", width: 1200, height: 1565, alt: "Wolves editorial, image 4" },
        },
        {
          id: "wlv-b4",
          type: "photo",
          data: { src: "/winter/wolves-5.jpg", width: 1200, height: 1499, alt: "Wolves editorial, image 5" },
        },
        {
          id: "wlv-b5",
          type: "photo",
          data: { src: "/winter/wolves-6.jpg", width: 1200, height: 1500, alt: "Wolves editorial, image 6" },
        },
        {
          id: "wlv-b6",
          type: "photo",
          data: { src: "/winter/wolves-7.jpg", width: 1200, height: 1500, alt: "Wolves editorial, image 7" },
        },
        {
          id: "wlv-b7",
          type: "photo",
          data: { src: "/winter/wolves-8.jpg", width: 1200, height: 1500, alt: "Wolves editorial, image 8" },
        },
        {
          id: "wlv-b8",
          type: "photo",
          data: { src: "/winter/wolves-9.jpg", width: 1200, height: 1500, alt: "Wolves editorial, image 9" },
        },
        {
          id: "wlv-b9",
          type: "photo",
          data: { src: "/winter/wolves-10.jpg", width: 1200, height: 1500, alt: "Wolves editorial, image 10" },
        },
        {
          id: "wlv-b10",
          type: "photo",
          data: { src: "/winter/wolves-11.jpg", width: 1200, height: 1679, alt: "Wolves editorial, image 11" },
        },
      ],
    },
    {
      slug: "agv",
      title: "AGV",
      subtitle: "Roses Aren't Always Red",
      year: 2025,
      cover: { src: "/winter/agv-1.jpg", width: 1596, height: 1994, alt: "Model in AGV racing helmet and green graphic top reading 'Roses Aren't Always Red'" },
      blocks: [],
    },
    {
      slug: "ef-portrait",
      title: "EF",
      subtitle: "Backstage detail",
      year: 2025,
      cover: { src: "/winter/ef-portrait-1.jpg", width: 1272, height: 1658, alt: "Two people seen from behind, close-cropped hair, one in a striped shirt and one in a blue EF EducationFirst jacket" },
      blocks: [],
    },
    {
      slug: "tennis-necklace",
      title: "Tennis Necklace",
      subtitle: "Detail study",
      year: 2025,
      cover: { src: "/winter/tennis-necklace-1.jpg", width: 1280, height: 1666, alt: "Close-up of a shirtless model with bleached hair, hand obscuring his face, wearing a diamond tennis necklace" },
      blocks: [],
    },
    {
      slug: "fur-portrait",
      title: "Gold Chain",
      subtitle: "Backstage portrait",
      year: 2025,
      cover: { src: "/winter/fur-portrait-1.jpg", width: 2076, height: 1672, alt: "Close-up portrait of a model with cropped platinum hair, freckled skin, a chunky gold chain necklace and white fur collar" },
      blocks: [],
    },
    {
      slug: "profile-portrait",
      title: "Profile",
      subtitle: "Two models, tailoring",
      year: 2025,
      cover: { src: "/winter/profile-portrait-1.jpg", width: 1232, height: 1668, alt: "Close profile portrait of a model in a tan jacket beside an out-of-focus model in a tie" },
      blocks: [],
    },
    {
      slug: "reclining",
      title: "Reclining",
      subtitle: "Portrait study",
      year: 2025,
      cover: { src: "/winter/reclining-1.jpg", width: 2504, height: 1668, alt: "Shirtless model reclining on a couch, head tilted back, shot from below" },
      blocks: [],
    },
    {
      slug: "necklace",
      title: "Beaded Necklace",
      subtitle: "Detail study",
      year: 2025,
      cover: { src: "/winter/necklace-1.jpg", width: 1522, height: 1986, alt: "Close-up of a beaded silver necklace on the back of a sweat-dampened neck" },
      blocks: [],
    },
    {
      slug: "canada-goose",
      title: "Canada Goose",
      subtitle: "With Jay Massacret and BeGood Studios",
      year: 2024,
      cover: { src: "/winter/canada-goose-1.jpg", width: 1459, height: 1765, alt: "Two models in Canada Goose outerwear, close crop" },
      blocks: [
        {
          id: "cg-b1",
          type: "photo",
          data: { src: "/winter/canada-goose-2.jpg", width: 1459, height: 1626, alt: "Model in Canada Goose bomber jacket, windswept" },
        },
        {
          id: "cg-b2",
          type: "photo",
          data: { src: "/winter/canada-goose-3.jpg", width: 1459, height: 1769, alt: "Female model in Canada Goose bomber, windswept hair" },
        },
      ],
    },
    {
      slug: "fantastic-man-china",
      title: "Fantastic Man China",
      subtitle: "With Jason Rider",
      year: 2025,
      cover: { src: "/winter/fmc-2.jpg", width: 1458, height: 1764, alt: "Close portrait of model in grey jacket with backpack" },
      blocks: [
        {
          id: "fmc-b1",
          type: "photo",
          data: { src: "/winter/fmc-1.jpg", width: 1444, height: 898, alt: "Three models walking from overhead, carrying camping gear" },
        },
      ],
    },
  ],
};
