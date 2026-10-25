export type HeroSource = { src: string; type: "video/webm" | "video/mp4" };
export type HeroMedia = {
  poster: string;
  sources: HeroSource[];
  mobileSources: HeroSource[];
};
export const heroFiles = {
  poster: "/images/brasa-noir-hero-poster.webp",
  desktop: [
    { src: "/videos/brasa-noir-hero.webm", type: "video/webm" },
    { src: "/videos/brasa-noir-hero.mp4", type: "video/mp4" },
  ],
  mobile: [
    { src: "/videos/brasa-noir-hero-mobile.webm", type: "video/webm" },
    { src: "/videos/brasa-noir-hero-mobile.mp4", type: "video/mp4" },
  ],
} satisfies { poster: string; desktop: HeroSource[]; mobile: HeroSource[] };
