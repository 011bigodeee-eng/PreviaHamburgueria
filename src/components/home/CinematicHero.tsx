"use client";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, Flame } from "lucide-react";
import HeroVideo from "./HeroVideo";
import type { HeroMedia } from "../../config/hero";

type HeroProps = {
  media: HeroMedia;
  hasItems: boolean;
  onOpenCart: () => void;
};

export default function CinematicHero({
  media,
  hasItems,
  onOpenCart,
}: HeroProps) {
  const reduced = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.62,
      delay: reduced ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });
  const titleReveal = (delay: number) => ({
    initial: { y: "110%" },
    animate: { y: 0 },
    transition: {
      duration: reduced ? 0 : 0.78,
      delay: reduced ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });
  return (
    <section
      className="hero cinematic-hero"
      id="inicio"
      aria-labelledby="hero-title"
    >
      <div className="hero-watermark" aria-hidden="true">
        ACORDEON
      </div>
      <div className="hero-content">
        <motion.div className="eyebrow" {...reveal(0)}>
          <span className="orange-line" /> ARTESANAL BURGER EXPERIENCE
        </motion.div>
        <h1 id="hero-title">
          <span className="cinema-title-mask">
            <motion.span
              className="cinema-title-line cinema-title-opening"
              {...titleReveal(0.04)}
            >
              O <em>fogo</em>
            </motion.span>
          </span>{" "}
          <span className="cinema-title-mask">
            <motion.span
              className="cinema-title-line cinema-title-middle"
              {...titleReveal(0.12)}
            >
              TEM UM NOVO
            </motion.span>
          </span>{" "}
          <span className="cinema-title-mask">
            <motion.span
              className="cinema-title-line cinema-title-ending"
              {...titleReveal(0.2)}
            >
              NOME<span className="orange">.</span>
            </motion.span>
          </span>
        </h1>
        <motion.p {...reveal(0.28)}>
          Carne selecionada, fogo de verdade e combinações que desafiam o comum.
        </motion.p>
        <motion.div className="hero-buttons" {...reveal(0.34)}>
          <a className="button hero-explore" href="#cardapio">
            EXPLORAR CARDÁPIO <ArrowUpRight size={20} />
          </a>
          <a
            className="text-button hero-order"
            href="#cardapio"
            onClick={(event) => {
              if (hasItems) {
                event.preventDefault();
                onOpenCart();
              }
            }}
          >
            FAZER MEU PEDIDO <ArrowRight size={18} />
          </a>
        </motion.div>
        <motion.div className="hero-detail" {...reveal(0.4)}>
          <Flame size={15} />
          <span>O SABOR COMEÇA NA BRASA.</span>
        </motion.div>
      </div>
      <div className="cinema-stage">
        <div className="cinema-stage-label" aria-hidden="true">
          <span>ACORDEON / FEITO COM ATITUDE</span>
          <span className="cinema-stage-line" />
        </div>
        <HeroVideo media={media} />
        <span className="cinema-disclosure">IMAGEM ILUSTRATIVA · IA</span>
      </div>
      <div className="hero-bottom">
        <a href="#destaques">
          <span className="scroll-circle">
            <ArrowDown size={17} />
          </span>
          <span>DESCUBRA SUA PRÓXIMA OBSESSÃO</span>
        </a>
        <div className="hero-promises">
          <span>INGREDIENTES SELECIONADOS</span>
          <span>PREPARO ARTESANAL</span>
        </div>
      </div>
    </section>
  );
}
