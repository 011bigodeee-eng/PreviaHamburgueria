import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import HeroVideo from "../../src/components/home/HeroVideo";
import type { HeroMedia } from "../../src/config/hero";
vi.mock("next/image", () => ({
  default: ({ fill, priority, sizes, ...props }: Record<string, unknown>) => {
    void fill;
    void priority;
    void sizes;
    // The actual Next image optimizer is exercised by the browser suite.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt as string} />;
  },
}));
let reduced = false,
  mobile = false,
  hidden = false;
let intersect: IntersectionObserverCallback;
let paused = true;
const base: HeroMedia = {
  poster: "/images/brasa-noir-hero-poster.webp",
  sources: [{ src: "/videos/brasa-noir-hero.mp4", type: "video/mp4" }],
  mobileSources: [],
};
beforeEach(() => {
  reduced = false;
  mobile = false;
  hidden = false;
  paused = true;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduced-motion") ? reduced : mobile,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(
    () => paused,
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    paused = false;
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    paused = true;
    this.dispatchEvent(new Event("pause"));
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function visibility(visible: boolean) {
  act(() =>
    intersect(
      [
        {
          isIntersecting: visible,
          intersectionRatio: visible ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    ),
  );
}
describe("cinematic player lifecycle (mocked browser media APIs; no real video supplied)", () => {
  test("absent assets and reduced motion render only the poster", () => {
    const view = render(<HeroVideo media={{ ...base, sources: [] }} />);
    expect(document.querySelector("video")).toBeNull();
    expect(screen.getByText(/FIRE. FLAVOR. OBSESSION./)).toBeTruthy();
    reduced = true;
    view.rerender(<HeroVideo media={base} />);
    expect(document.querySelector("video")).toBeNull();
    expect(screen.getByRole("img")).toBeTruthy();
  });
  test("sets inline/muted/loop, pauses offscreen/hidden and respects manual pause", async () => {
    render(<HeroVideo media={base} />);
    const video = document.querySelector("video")!;
    expect(
      video.autoplay && video.muted && video.loop && video.playsInline,
    ).toBe(true);
    expect(video.getAttribute("preload")).toBe("none");
    visibility(true);
    await waitFor(() => expect(video.className).toContain("is-playing"));
    visibility(false);
    expect(paused).toBe(true);
    visibility(true);
    expect(paused).toBe(false);
    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    expect(paused).toBe(true);
    hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    expect(paused).toBe(false);
    fireEvent.click(
      screen.getByRole("button", { name: "Pausar vídeo do hero" }),
    );
    expect(paused).toBe(true);
    visibility(false);
    visibility(true);
    expect(paused).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Reproduzir vídeo do hero" }),
    );
    expect(paused).toBe(false);
  });
  test("autoplay rejection keeps poster and allows a manual retry", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new DOMException("Autoplay blocked", "NotAllowedError"),
    );
    render(<HeroVideo media={base} />);
    visibility(true);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Reproduzir vídeo do hero" }),
      ).toBeTruthy(),
    );
    expect(document.querySelector("video")!.className).not.toContain(
      "is-playing",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reproduzir vídeo do hero" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Pausar vídeo do hero" }),
      ).toBeTruthy(),
    );
  });
  test("tries the alternate source before falling back when all sources fail", () => {
    render(
      <HeroVideo
        media={{
          ...base,
          sources: [
            { src: "/videos/brasa-noir-hero.webm", type: "video/webm" },
            ...base.sources,
          ],
        }}
      />,
    );
    const sources = document.querySelectorAll("source");
    fireEvent.error(sources[0]);
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.error(sources[1]);
    expect(screen.getByRole("status").textContent).toContain("imagem estática");
    expect(screen.queryByRole("button")).toBeNull();
  });
  test("media error and a stalled load restore the poster", () => {
    vi.useFakeTimers();
    render(<HeroVideo media={base} />);
    visibility(true);
    fireEvent.waiting(document.querySelector("video")!);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("status").textContent).toContain("imagem estática");
    cleanup();
    render(<HeroVideo media={base} />);
    fireEvent.error(document.querySelector("video")!);
    expect(screen.getByRole("status")).toBeTruthy();
  });
  test("mobile variant replaces desktop sources rather than loading both", () => {
    mobile = true;
    render(
      <HeroVideo
        media={{
          ...base,
          mobileSources: [
            { src: "/videos/brasa-noir-hero-mobile.mp4", type: "video/mp4" },
          ],
        }}
      />,
    );
    expect(document.querySelectorAll("source")).toHaveLength(1);
    expect(document.querySelector("source")!.getAttribute("src")).toContain(
      "hero-mobile.mp4",
    );
  });
});
