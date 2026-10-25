import "server-only";
import { statSync } from "node:fs";
import { basename, join } from "node:path";
import { heroFiles, type HeroMedia, type HeroSource } from "../config/hero";

/** Build-time discovery prevents requests to assets that have not been supplied. */
export function getHeroMedia(): HeroMedia {
  const exists = (source: HeroSource) => {
    try {
      const file = statSync(
        join(process.cwd(), "public", "videos", basename(source.src)),
      );
      return file.isFile() && file.size > 0;
    } catch {
      return false;
    }
  };
  return {
    poster: heroFiles.poster,
    sources: heroFiles.desktop.filter(exists),
    mobileSources: heroFiles.mobile.filter(exists),
  };
}
