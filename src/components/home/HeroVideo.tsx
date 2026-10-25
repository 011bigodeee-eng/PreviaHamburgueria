"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Pause, Play } from "lucide-react";
import type { HeroMedia, HeroSource } from "../../config/hero";

function useMediaQuery(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => serverValue);
}

export default function HeroVideo({ media }: { media: HeroMedia }) {
  // SSR always renders the poster, so reduced-motion users never download a video.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const mobile = useMediaQuery("(max-width: 760px)", false);
  const sources =
    mobile && media.mobileSources.length ? media.mobileSources : media.sources;
  return (
    <div
      className="cinema-scene"
      role="group"
      aria-label="Cena gastronômica BRASA NOIR"
    >
      <Image
        className="cinema-poster"
        src={media.poster}
        alt="Hambúrguer com alface, tomate, carne e cebola roxa; frame do vídeo fornecido"
        fill
        sizes="(max-width: 760px) 100vw, 58vw"
        priority
        style={{ objectFit: "contain" }}
      />
      {!reduced && sources.length > 0 && (
        <VideoPlayback
          key={sources.map((s) => s.src).join("|")}
          sources={sources}
          poster={media.poster}
        />
      )}
      <div className="cinema-vignette" aria-hidden="true" />
      <span className="cinema-caption">
        {sources.length === 0
          ? "PRÉVIA ESTÁTICA · VÍDEO A ADICIONAR"
          : reduced
            ? "MOVIMENTO REDUZIDO · IMAGEM ESTÁTICA"
            : "FIRE. FLAVOR. OBSESSION."}
      </span>
    </div>
  );
}

function VideoPlayback({
  sources,
  poster,
}: {
  sources: HeroSource[];
  poster: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const failedSources = useRef(new Set<string>());
  const failed = useRef(false);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const activePlay = useRef(0);
  const [unavailable, setUnavailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let disposed = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    function clearWatchdog() {
      if (watchdog) clearTimeout(watchdog);
    }
    function stop() {
      activePlay.current += 1;
      clearWatchdog();
      video!.pause();
    }
    function fallback() {
      if (disposed) return;
      failed.current = true;
      stop();
      setPlaying(false);
      setUnavailable(true);
    }
    function armWatchdog() {
      clearWatchdog();
      // A stalled connection must not leave a black or frozen hero indefinitely.
      watchdog = setTimeout(fallback, 12000);
    }
    function updatePlayback() {
      if (disposed || failed.current) return;
      if (!inView.current || document.hidden || userPaused.current) {
        stop();
        return;
      }
      const attempt = ++activePlay.current;
      video!.muted = true;
      armWatchdog();
      video!.play()?.catch(() => {
        // Browsers may reject autoplay (notably low-power mode). Keep the poster
        // and expose a manual play button instead of surfacing an error.
        if (!disposed && attempt === activePlay.current) {
          clearWatchdog();
          setPlaying(false);
        }
      });
    }
    function onPlaying() {
      clearWatchdog();
    }
    function onWaiting() {
      if (inView.current && !document.hidden && !userPaused.current)
        armWatchdog();
    }
    const observer = new IntersectionObserver(
      (entries) => {
        inView.current = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.12,
        );
        updatePlayback();
      },
      { threshold: 0.12 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", updatePlayback);
    video.addEventListener("hero-playback-intent", updatePlayback);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onWaiting);
    video.addEventListener("error", fallback);
    video.addEventListener("hero-source-failure", fallback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      video.removeEventListener("hero-playback-intent", updatePlayback);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onWaiting);
      video.removeEventListener("error", fallback);
      video.removeEventListener("hero-source-failure", fallback);
      stop();
    };
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video || unavailable) return;
    userPaused.current = !video.paused;
    video.dispatchEvent(new Event("hero-playback-intent"));
  }
  function sourceError(src: string) {
    failedSources.current.add(src);
    if (failedSources.current.size === sources.length)
      ref.current?.dispatchEvent(new Event("hero-source-failure"));
  }
  return (
    <>
      <video
        ref={ref}
        className={`cinema-video ${playing && !unavailable ? "is-playing" : ""}`}
        autoPlay
        muted
        playsInline
        loop
        preload="none"
        poster={poster}
        width={1440}
        height={1080}
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setPlaying(false)}
      >
        {sources.map((source) => (
          <source
            key={source.src}
            src={source.src}
            type={source.type}
            onError={() => sourceError(source.src)}
          />
        ))}
      </video>
      {!unavailable && (
        <button
          className="cinema-control"
          type="button"
          onClick={toggle}
          aria-label={
            playing ? "Pausar vídeo do hero" : "Reproduzir vídeo do hero"
          }
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
          <span>{playing ? "PAUSAR CENA" : "REPRODUZIR CENA"}</span>
        </button>
      )}
      {unavailable && (
        <span className="cinema-unavailable" role="status">
          Cena indisponível. Exibindo imagem estática.
        </span>
      )}
    </>
  );
}
