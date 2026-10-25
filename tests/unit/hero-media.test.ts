import { expect, test, vi } from "vitest";
import { statSync } from "node:fs";
vi.mock("server-only", () => ({}));
vi.mock("node:fs", () => ({ statSync: vi.fn() }));
import { getHeroMedia } from "../../src/lib/hero-media.server";

test("manifest excludes missing/empty files and discovers desktop and mobile assets independently", () => {
  const stat = vi.mocked(statSync);
  stat.mockImplementation(() => {
    throw new Error("ENOENT");
  });
  expect(getHeroMedia().sources).toEqual([]);
  stat.mockImplementation((file) => {
    const path = String(file);
    if (path.endsWith("/brasa-noir-hero.webm"))
      return { isFile: () => true, size: 0 } as ReturnType<typeof statSync>;
    if (
      path.endsWith("/brasa-noir-hero.mp4") ||
      path.endsWith("/brasa-noir-hero-mobile.webm")
    )
      return { isFile: () => true, size: 100 } as ReturnType<typeof statSync>;
    throw new Error("ENOENT");
  });
  const media = getHeroMedia();
  expect(media.sources).toEqual([
    { src: "/videos/brasa-noir-hero.mp4", type: "video/mp4" },
  ]);
  expect(media.mobileSources).toEqual([
    { src: "/videos/brasa-noir-hero-mobile.webm", type: "video/webm" },
  ]);
  expect(media.poster).toBe("/images/brasa-noir-hero-poster.webp");
  expect(
    stat.mock.calls.every(([file]) => String(file).includes("/public/videos/")),
  ).toBe(true);
});
