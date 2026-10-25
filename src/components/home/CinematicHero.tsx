"use client";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import HeroVideo from "./HeroVideo";
import type { HeroMedia } from "../../config/hero";

export default function CinematicHero({ media }: { media: HeroMedia }) {
  const reduced = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.7,
      delay: reduced ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });
  return (
    <section className="hero cinematic-hero" id="inicio">
      <div className="hero-watermark" aria-hidden="true">
        NOIR
      </div>
      <div className="hero-content">
        <motion.div className="eyebrow" {...reveal(0)}>
          <span className="orange-line" /> ARTESANAL BURGER EXPERIENCE
        </motion.div>
        <h1>
          <motion.span className="cinema-title-line" {...reveal(0.06)}>
            O <em>fogo</em> tem
          </motion.span>
          <motion.span className="cinema-title-line" {...reveal(0.14)}>
            um novo
          </motion.span>
          <motion.span
            className="cinema-title-line hero-last-line"
            {...reveal(0.22)}
          >
            nome<span className="orange">.</span>
          </motion.span>
        </h1>
        <motion.p {...reveal(0.3)}>
          Carne selecionada, fogo de verdade e combinações que desafiam o comum.
        </motion.p>
        <motion.div className="hero-buttons" {...reveal(0.38)}>
          <a className="button" href="#cardapio">
            EXPLORAR CARDÁPIO <ArrowUpRight size={20} />
          </a>
          <a className="text-button" href="#cardapio">
            FAZER MEU PEDIDO <ArrowRight size={17} />
          </a>
        </motion.div>
        <motion.div className="hero-detail" {...reveal(0.44)}>
          <span className="hero-detail-line" />
          <span>FIRE. FLAVOR. OBSESSION.</span>
        </motion.div>
      </div>
      <div className="cinema-stage">
        <HeroVideo media={media} />
        <span className="cinema-disclosure">
          MONTAGEM ARTESANAL · BRASA NOIR
        </span>
      </div>
      <div className="hero-bottom">
        <a href="#destaques">
          <span className="scroll-circle">
            <ArrowDown size={17} />
          </span>
          <span>DESCUBRA SUA PRÓXIMA OBSESSÃO</span>
        </a>
        <div className="hero-promises">
          <span>BLEND AUTORAL</span>
          <span>FEITO NA BRASA</span>
          <span>SEM ATALHOS</span>
        </div>
      </div>
    </section>
  );
}
