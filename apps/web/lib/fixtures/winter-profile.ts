import type { Profile } from "@portfolio/schema";

export const winterProfile: Profile = {
  username: "winter",
  displayName: "Winter Vandenbrink",
  role: "Photographer",
  hero: { src: "/winter/moncler-8.jpg", width: 1200, height: 1314, alt: "Four models in Moncler AW25, photographed by Winter Vandenbrink for AnOther Magazine" },
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
      slug: "u-republica",
      title: "U-Republica",
      subtitle: "With Louise Ford",
      year: 2025,
      cover: { src: "/winter/u-republica-1.jpg", width: 1600, height: 2087, alt: "Black and white portrait of model in cardigan" },
      blocks: [
        {
          id: "ur-b1",
          type: "photo",
          data: { src: "/winter/u-republica-2.jpg", width: 1600, height: 2087, alt: "Two men seated in antique chairs, black and white" },
        },
        {
          id: "ur-b2",
          type: "photo",
          data: { src: "/winter/u-republica-3.jpg", width: 1600, height: 2087, alt: "Portrait at kitchen table, black and white" },
        },
      ],
    },
    {
      slug: "givenchy",
      title: "Selfservice — Givenchy",
      subtitle: "With Malina Joseph Gilchrist",
      year: 2025,
      cover: { src: "/winter/givenchy-2.jpg", width: 1600, height: 2087, alt: "Model in black leather against Times Square flag backdrop" },
      blocks: [
        {
          id: "giv-b1",
          type: "photo",
          data: { src: "/winter/givenchy-1.jpg", width: 1600, height: 2087, alt: "Model in black backless suit walking past NYC construction barriers" },
        },
        {
          id: "giv-b2",
          type: "photo",
          data: { src: "/winter/givenchy-3.jpg", width: 1600, height: 2087, alt: "Model in backless black dress on NYC street" },
        },
        {
          id: "giv-b3",
          type: "photo",
          data: { src: "/winter/givenchy-4.jpg", width: 1600, height: 2087, alt: "Model in nude bodysuit and ankle boots leaning on glass" },
        },
      ],
    },
    {
      slug: "fantastic-man",
      title: "Fantastic Man",
      subtitle: "No. 41 — With Sydney Rose Thomas",
      year: 2025,
      cover: { src: "/winter/fantastic-man-2.jpg", width: 1600, height: 2087, alt: "Fantastic Man No. 41 AW25 cover" },
      blocks: [
        {
          id: "fm-b1",
          type: "photo",
          data: { src: "/winter/fantastic-man-1.jpg", width: 1600, height: 2087, alt: "Man in embroidered sweater with motion blur" },
        },
      ],
    },
    {
      slug: "canada-goose",
      title: "Canada Goose",
      subtitle: "With Jay Massacret and BeGood Studios",
      year: 2024,
      cover: { src: "/winter/canada-goose-1.jpg", width: 1600, height: 2087, alt: "Two models in Canada Goose outerwear, close crop" },
      blocks: [
        {
          id: "cg-b1",
          type: "photo",
          data: { src: "/winter/canada-goose-2.jpg", width: 1600, height: 2087, alt: "Model in Canada Goose bomber jacket, windswept" },
        },
        {
          id: "cg-b2",
          type: "photo",
          data: { src: "/winter/canada-goose-3.jpg", width: 1600, height: 2087, alt: "Female model in Canada Goose bomber, windswept hair" },
        },
      ],
    },
    {
      slug: "ysl",
      title: "Saint Laurent",
      subtitle: "Dominic Fike & Charlotte Gainsbourg",
      year: 2025,
      cover: { src: "/winter/ysl-2.jpg", width: 1600, height: 2087, alt: "Charlotte Gainsbourg in Saint Laurent" },
      blocks: [
        {
          id: "ysl-b1",
          type: "photo",
          data: { src: "/winter/ysl-1.jpg", width: 1600, height: 2087, alt: "Dominic Fike in Saint Laurent suit" },
        },
      ],
    },
    {
      slug: "fantastic-man-china",
      title: "Fantastic Man China",
      subtitle: "With Jason Rider",
      year: 2025,
      cover: { src: "/winter/fmc-2.jpg", width: 1600, height: 2087, alt: "Close portrait of model in grey jacket with backpack" },
      blocks: [
        {
          id: "fmc-b1",
          type: "photo",
          data: { src: "/winter/fmc-1.jpg", width: 1600, height: 2087, alt: "Three models walking from overhead, carrying camping gear" },
        },
      ],
    },
    {
      slug: "prada",
      title: "Prada",
      subtitle: "With Olivier Rizzo",
      year: 2025,
      cover: { src: "/winter/prada-1.jpg", width: 1600, height: 2087, alt: "Prada sandals close-up on grey pavement" },
      blocks: [
        {
          id: "prada-b1",
          type: "photo",
          data: { src: "/winter/prada-2.jpg", width: 1600, height: 2087, alt: "Black Prada loafers with socks, concrete floor" },
        },
      ],
    },
    {
      slug: "zara",
      title: "Zara",
      subtitle: "With Shotaro Yamaguchi",
      year: 2025,
      cover: { src: "/winter/zara-1.jpg", width: 1600, height: 2087, alt: "Two models in Zara long coats on a Tokyo street" },
      blocks: [],
    },
    {
      slug: "uniqlo",
      title: "Uniqlo AW25",
      subtitle: "With Jane How & Clare Waight Keller",
      year: 2025,
      cover: { src: "/winter/uniqlo-1.jpg", width: 1600, height: 2087, alt: "Male model in Uniqlo coat reflected in glass" },
      blocks: [],
    },
  ],
};
