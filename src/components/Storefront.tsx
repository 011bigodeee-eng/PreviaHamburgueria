"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  Flame,
  Menu,
  Plus,
  ShoppingBag,
  X,
  Check,
  Trash2,
  ArrowUpRight,
  Leaf,
  ChefHat,
} from "lucide-react";
import {
  CartItem,
  extras,
  money,
  Product,
  products,
  unitPrice,
} from "../data/menu";
import { business, whatsappReady } from "../config/business";
import Checkout from "./checkout/Checkout";
import { Modal, Quantity } from "./ui/Controls";

const imagePositions: Record<string, string> = {
  classic: "0% 0%",
  inferno: "50% 0%",
  truffle: "100% 0%",
  smoke: "0% 100%",
  supreme: "50% 100%",
  combo: "100% 100%",
  fries: "50% 0%",
  "cheddar-fries": "100% 0%",
  soda: "0% 100%",
  water: "50% 100%",
  shake: "100% 100%",
};
function ProductImage({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <Image
        src={product.imageUrl}
        alt={product.imageAlt || product.name}
        fill
        sizes="(max-width: 760px) 90vw, 33vw"
        style={{ objectFit: "cover" }}
      />
    );
  }
  const secondary = [
    "fries",
    "cheddar-fries",
    "soda",
    "water",
    "shake",
  ].includes(product.image);
  return (
    <div
      className="food-visual"
      role="img"
      aria-label={`${product.name}, imagem ilustrativa gerada por IA`}
      style={{
        backgroundImage: `url(/images/${secondary ? "sides" : "burgers"}.webp)`,
        backgroundPosition: imagePositions[product.image] || "0% 0%",
      }}
    />
  );
}
export default function Storefront() {
  const [intro, setIntro] = useState(false),
    [mobile, setMobile] = useState(false),
    [active, setActive] = useState("inicio"),
    [scrolled, setScrolled] = useState(false),
    [category, setCategory] = useState("Todos"),
    [selected, setSelected] = useState<Product | null>(null),
    [quantity, setQuantity] = useState(1),
    [chosen, setChosen] = useState<string[]>([]),
    [notes, setNotes] = useState(""),
    [cart, setCart] = useState<CartItem[]>([]),
    [hydrated, setHydrated] = useState(false),
    [drawer, setDrawer] = useState(false),
    [checkout, setCheckout] = useState(false),
    [toast, setToast] = useState("");
  // Hydrate the browser storage after SSR; persisted state is unavailable on the server.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("brasa-cart-v1") || "[]");
      if (Array.isArray(stored))
        setCart(
          stored.filter(
            (i: CartItem) =>
              products.some((p) => p.id === i.productId) &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 99 &&
              Array.isArray(i.extraIds) &&
              i.extraIds.every((id) => extras.some((e) => e.id === id)) &&
              new Set(i.extraIds).size === i.extraIds.length &&
              typeof i.notes === "string" &&
              typeof i.key === "string",
          ),
        );
    } catch {}
    setHydrated(true);
    let introSeen = true;
    try {
      introSeen = !!sessionStorage.getItem("brasa-intro");
    } catch {}
    if (!introSeen && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntro(true);
      try {
        sessionStorage.setItem("brasa-intro", "1");
      } catch {}
      const t = setTimeout(() => setIntro(false), 2200);
      return () => clearTimeout(t);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("brasa-cart-v1", JSON.stringify(cart));
      } catch {
        /* Keep the current in-memory order when storage is unavailable. */
      }
    }
  }, [cart, hydrated]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const navigationObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    for (const id of [
      "inicio",
      "cardapio",
      "essencia",
      "avaliacoes",
      "contato",
    ]) {
      const section = document.getElementById(id);
      if (section) navigationObserver.observe(section);
    }
    return () => navigationObserver.disconnect();
  }, []);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".section-top,.combo-copy,.essence-copy")
      .forEach((element) => {
        element.classList.add("reveal-ready");
        observer.observe(element);
      });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobile]);
  function open(p: Product) {
    setSelected(p);
    setQuantity(1);
    setChosen([]);
    setNotes("");
  }
  function add() {
    if (!selected) return;
    const extraIds = [...chosen].sort();
    const cleanNotes = notes.trim();
    const key = JSON.stringify([selected.id, extraIds, cleanNotes]);
    setCart((old) => {
      const existing = old.find((i) => i.key === key);
      return existing
        ? old.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
              : i,
          )
        : [
            ...old,
            {
              key,
              productId: selected.id,
              quantity,
              extraIds,
              notes: cleanNotes,
            },
          ];
    });
    setSelected(null);
    setToast("Adicionado ao seu pedido. O fogo está aceso.");
  }
  const count = cart.reduce((s, i) => s + i.quantity, 0),
    subtotal = cart.reduce((s, i) => s + unitPrice(i) * i.quantity, 0);
  const nav = [
    ["Início", "inicio"],
    ["Cardápio", "cardapio"],
    ["Nossa essência", "essencia"],
    ["Avaliações", "avaliacoes"],
    ["Contato", "contato"],
  ];
  return (
    <>
      <a className="skip-link" href="#cardapio">
        Pular para o cardápio
      </a>
      {intro && (
        <div className="intro">
          <div className="intro-line" />
          <Flame size={36} />
          <div className="wordmark">
            BRASA<span>NOIR</span>
          </div>
          <p>FIRE. FLAVOR. OBSESSION.</p>
          <button onClick={() => setIntro(false)}>
            Pular introdução <ArrowRight size={14} />
          </button>
        </div>
      )}
      <header className={scrolled ? "scrolled" : ""}>
        <a className="logo" href="#inicio" aria-label="Brasa Noir, início">
          <Flame className="brand-flame" />
          <span>
            BRASA<span className="logo-noir">NOIR</span>
            <small>FIRE. FLAVOR. OBSESSION.</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {nav.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="cart-button"
            aria-label={`Abrir carrinho, ${count} itens`}
            onClick={() => {
              setDrawer(true);
              setCheckout(false);
            }}
          >
            <ShoppingBag size={21} />
            <span>{count}</span>
          </button>
          <a href="#cardapio" className="button small header-order">
            PEDIR AGORA <ArrowUpRight size={15} />
          </a>
          <button
            className="icon-button mobile-toggle"
            aria-label={mobile ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
        {mobile && (
          <nav className="mobile-nav" aria-label="Navegação mobile">
            {nav.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                onClick={() => setMobile(false)}
              >
                {label}
                <ArrowUpRight size={18} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main>
        <section className="hero" id="inicio">
          <div className="hero-image">
            <div
              className="food-visual hero-food"
              role="img"
              aria-label="Hambúrguer artesanal com cheddar e bacon, imagem ilustrativa gerada por IA"
            />
            <div className="photo-credit">
              IMAGEM ILUSTRATIVA · GERADA POR IA
            </div>
          </div>
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow">
              <span className="orange-line" /> ARTESANAL BURGER EXPERIENCE
            </div>
            <h1>
              O <em>FOGO</em> TEM
              <br />
              UM NOVO NOME<span className="orange">.</span>
            </h1>
            <p>
              Carne selecionada, fogo de verdade e combinações que desafiam o
              comum. Descubra o sabor que não aceita ser esquecido.
            </p>
            <div className="hero-buttons">
              <a className="button" href="#cardapio">
                EXPLORAR CARDÁPIO <ArrowUpRight size={18} />
              </a>
              <a className="text-button" href="#destaques">
                FAZER MEU PEDIDO <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-detail">
              <Flame size={17} />
              <span>FEITO NO FOGO. SERVIDO COM ATITUDE.</span>
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#destaques">
              <span>DESÇA. O SABOR ESTÁ SÓ COMEÇANDO.</span>
              <ArrowDown size={16} />
            </a>
            <span className="hero-edition">
              EST. 2026 <span> / </span> BURGERS SEM CONCESSÕES
            </span>
          </div>
          <span className="hero-side">
            NÃO É APENAS UM BURGER. É UMA OBSESSÃO.
          </span>
        </section>
        <div className="manifesto-strip">
          <span>FIRE.</span>
          <Flame />
          <span>FLAVOR.</span>
          <Flame />
          <span>OBSESSION.</span>
          <Flame />
          <span>BRASA NOIR.</span>
          <Flame />
        </div>
        <section className="section featured" id="destaques">
          <div className="section-top">
            <div>
              <div className="eyebrow">01 / OS FAVORITOS DA BRASA</div>
              <h2>
                NASCIDOS NO FOGO.
                <br />
                <span className="muted">FEITOS PARA MARCAR.</span>
              </h2>
            </div>
            <a className="text-button" href="#cardapio">
              VER CARDÁPIO COMPLETO <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="featured-grid">
            {products.slice(0, 3).map((p, i) => (
              <article className="product-card" key={p.id}>
                <button
                  className="product-photo"
                  onClick={() => open(p)}
                  aria-label={`Ver detalhes de ${p.name}`}
                >
                  <ProductImage product={p} />
                  <span className="product-index">0{i + 1}</span>
                  <span className="product-tag">{p.tag}</span>
                  <span className="photo-label">IMAGEM ILUSTRATIVA</span>
                </button>
                <div className="product-info">
                  <div className="product-title">
                    <h3>
                      <button onClick={() => open(p)}>{p.name}</button>
                    </h3>
                    <span>{money(p.price)}</span>
                  </div>
                  <p>{p.description}</p>
                  <button className="add-button" onClick={() => open(p)}>
                    ADICIONAR AO PEDIDO <Plus size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="combo-section">
          <div className="combo-art">
            <div
              className="food-visual combo-food"
              role="img"
              aria-label="Combo com hambúrguer, fritas e bebida, imagem ilustrativa gerada por IA"
            />
            <span className="combo-stamp">
              O DOBRO
              <br />
              DA INTENSIDADE
              <Flame size={25} />
            </span>
          </div>
          <div className="combo-copy">
            <div className="eyebrow">O MATCH PERFEITO EXISTE.</div>
            <h2>
              MAIS FOGO.
              <br />
              MAIS <em>SABOR.</em>
            </h2>
            <p>
              O Inferno Double encontrou sua melhor companhia. Burger, fritas
              crocantes e refrigerante. Sem espaço para o básico.
            </p>
            <div className="combo-price">
              <span>
                COMBO INFERNO<small>A EXPERIÊNCIA COMPLETA</small>
              </span>
              <strong>{money(6290)}</strong>
            </div>
            <button className="button" onClick={() => open(products[6])}>
              QUERO ESSE COMBO <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
        <section className="section menu-section" id="cardapio">
          <div className="section-top">
            <div>
              <div className="eyebrow">02 / SEU PRÓXIMO FAVORITO</div>
              <h2>
                ESCOLHA SUA
                <br />
                PRÓXIMA <em>OBSESSÃO.</em>
              </h2>
            </div>
            <p className="section-note">
              Ingredientes de verdade.
              <br />
              Combinações fora do comum.
              <br />
              Todos os caminhos levam à brasa.
            </p>
          </div>
          <div className="filters" aria-label="Filtrar cardápio">
            {["Todos", "Burgers", "Combos", "Acompanhamentos", "Bebidas"].map(
              (c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                  {c === category && <span>↗</span>}
                </button>
              ),
            )}
          </div>
          <div className="menu-grid">
            {products
              .filter((p) => category === "Todos" || p.category === category)
              .map((p) => (
                <article className="menu-item" key={p.id}>
                  <button
                    className="menu-photo"
                    onClick={() => open(p)}
                    aria-label={`Personalizar ${p.name}`}
                  >
                    <ProductImage product={p} />
                    <span className="placeholder-label">
                      {p.imageUrl ? "FOTO ILUSTRATIVA" : "ILUSTRAÇÃO IA"}
                    </span>
                  </button>
                  <div>
                    <span className="eyebrow menu-category">{p.category}</span>
                    <h3>
                      <button onClick={() => open(p)}>{p.name}</button>
                    </h3>
                    <p>{p.description}</p>
                    <div className="menu-item-bottom">
                      <strong>{money(p.price)}</strong>
                      <button
                        className="plus-button"
                        aria-label={`Adicionar ${p.name}`}
                        onClick={() => open(p)}
                      >
                        <Plus size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </div>
          <p className="demo-note">
            Cardápio demonstrativo · Imagens provisórias geradas por IA ·
            Substituir por fotos reais · Produtos e preços editáveis
          </p>
        </section>
        <section className="essence" id="essencia">
          <div className="essence-photo">
            <div
              className="food-visual essence-food"
              role="img"
              aria-label="Preparo artesanal na grelha, imagem ilustrativa gerada por IA"
            />
            <div className="image-caption">
              O NOSSO INGREDIENTE SECRETO? OBSESSÃO.
            </div>
          </div>
          <div className="essence-copy">
            <div className="eyebrow">03 / NOSSA ESSÊNCIA</div>
            <h2>
              AQUI, O FOGO
              <br />É PARTE DA
              <br />
              <em>RECEITA.</em>
            </h2>
            <p>
              Na BRASA NOIR, cada detalhe importa. Do blend cuidadosamente
              selecionado ao pão tostado no ponto certo, nossa obsessão é
              transformar ingredientes em experiências inesquecíveis.
            </p>
            <div className="pillars">
              <div>
                <Leaf />
                <span>INGREDIENTES SELECIONADOS</span>
              </div>
              <div>
                <ChefHat />
                <span>PREPARO ARTESANAL</span>
              </div>
              <div>
                <Flame />
                <span>SABOR SEM COMPROMISSOS</span>
              </div>
            </div>
          </div>
        </section>
        <section className="section reviews" id="avaliacoes">
          <div className="section-top">
            <div>
              <div className="eyebrow">04 / EXPERIÊNCIAS QUE FICAM</div>
              <h2>
                QUEM PROVA,
                <br />
                <span className="muted">ENTENDE.</span>
              </h2>
            </div>
            <p className="section-note">
              Uma marca fictícia.
              <br />
              Uma obsessão muito bem imaginada.
            </p>
          </div>
          <div className="reviews-grid">
            {[
              [
                "“A primeira mordida já diz tudo. O equilíbrio do bacon com o molho da casa é absurdo.”",
                "Marina R.",
                "NOIR CLASSIC",
              ],
              [
                "“O Inferno Double faz jus ao nome. Intenso, suculento e com a picância no ponto.”",
                "Lucas M.",
                "INFERNO DOUBLE",
              ],
              [
                "“O trufado é outra experiência. Da apresentação ao último pedaço, cada detalhe conta.”",
                "Camila S.",
                "BLACK TRUFFLE",
              ],
            ].map(([quote, name, burger]) => (
              <blockquote key={name}>
                <div className="review-mark">“</div>
                <p>{quote}</p>
                <footer>
                  <span>
                    {name}
                    <small>DEPOIMENTO DEMONSTRATIVO</small>
                  </span>
                  <span className="review-burger">{burger}</span>
                </footer>
              </blockquote>
            ))}
          </div>
          <p className="demo-note">
            Depoimentos fictícios para demonstração. Não representam avaliações
            reais de clientes.
          </p>
        </section>
        <section className="contact section" id="contato">
          <div>
            <div className="eyebrow">05 / A GENTE SE ENCONTRA NA BRASA</div>
            <h2>
              SUA FOME.
              <br />
              NOSSO <em>FOGO.</em>
            </h2>
            <a className="button" href="#cardapio">
              COMEÇAR MEU PEDIDO <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="contact-info">
            <div>
              <span>ONDE ACONTECE</span>
              <p>{business.address || "Endereço a configurar"}</p>
            </div>
            <div>
              <span>QUANDO A BRASA ACENDE</span>
              <p>{business.hours || "Horário de funcionamento a configurar"}</p>
            </div>
            <div>
              <span>VAMOS CONVERSAR</span>
              <p>
                {whatsappReady ? (
                  <a
                    href={`https://wa.me/${business.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp <ArrowUpRight size={16} />
                  </a>
                ) : (
                  "WhatsApp ainda não configurado"
                )}
                {business.instagram.startsWith(
                  "https://www.instagram.com/",
                ) && (
                  <a href={business.instagram} target="_blank" rel="noreferrer">
                    Instagram <ArrowUpRight size={16} />
                  </a>
                )}
              </p>
            </div>
            <p className="demo-note">
              Marca fictícia · Prévia demonstrativa.
              <br />
              Entrega e retirada sujeitas à confirmação do estabelecimento.
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a href="#inicio" className="footer-wordmark">
          BRASA<span>NOIR</span>
          <Flame />
        </a>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} BRASA NOIR · PROJETO DEMONSTRATIVO
          </span>
          <span>FIRE. FLAVOR. OBSESSION.</span>
          <a href="#inicio">VOLTAR AO TOPO ↑</a>
        </div>
      </footer>
      {count > 0 && !drawer && (
        <button className="mobile-cart button" onClick={() => setDrawer(true)}>
          <ShoppingBag size={18} />
          {count} {count === 1 ? "ITEM" : "ITENS"} · {money(subtotal)}
          <ArrowRight size={18} />
        </button>
      )}
      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        {toast && (
          <>
            <Check size={18} />
            {toast}
          </>
        )}
      </div>
      {selected && (
        <Modal
          title="PERSONALIZE SUA OBSESSÃO"
          onClose={() => setSelected(null)}
        >
          <div className="detail-image">
            <ProductImage product={selected} />
          </div>
          <h2 className="modal-title">{selected.name}</h2>
          <p className="detail-description">{selected.description}</p>
          <strong className="detail-price">{money(selected.price)}</strong>
          {selected.category === "Burgers" && (
            <fieldset className="extras">
              <legend>
                UM TOQUE A MAIS <small>Opcional · por unidade</small>
              </legend>
              {extras.map((e) => (
                <label key={e.id}>
                  <input
                    type="checkbox"
                    checked={chosen.includes(e.id)}
                    onChange={() =>
                      setChosen((old) =>
                        old.includes(e.id)
                          ? old.filter((id) => id !== e.id)
                          : [...old, e.id],
                      )
                    }
                  />
                  <span>{e.name}</span>
                  <strong>+ {money(e.price)}</strong>
                </label>
              ))}
            </fieldset>
          )}
          <label className="field">
            OBSERVAÇÕES
            <textarea
              maxLength={300}
              placeholder="Sem cebola? Um cuidado especial? Conte para nós."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="detail-actions">
            <Quantity value={quantity} onChange={setQuantity} />
            <button className="button" onClick={add}>
              ADICIONAR ·{" "}
              {money(
                (selected.price +
                  extras
                    .filter((e) => chosen.includes(e.id))
                    .reduce((s, e) => s + e.price, 0)) *
                  quantity,
              )}
              <Plus size={17} />
            </button>
          </div>
        </Modal>
      )}
      {drawer && (
        <Modal
          title={checkout ? "FINALIZAR PEDIDO" : "SEU PEDIDO"}
          drawer
          onClose={() => {
            setDrawer(false);
            setCheckout(false);
          }}
        >
          {checkout ? (
            <Checkout items={cart} onBack={() => setCheckout(false)} />
          ) : (
            <>
              <h2 className="modal-title">
                SUA PRÓXIMA
                <br />
                <em>OBSESSÃO.</em>
              </h2>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={46} />
                  <h3>A brasa está esperando.</h3>
                  <p>Seu pedido começa com um burger inesquecível.</p>
                  <button className="button" onClick={() => setDrawer(false)}>
                    EXPLORAR CARDÁPIO <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((i) => {
                      const p = products.find((p) => p.id === i.productId)!;
                      return (
                        <article className="cart-item" key={i.key}>
                          <div className="cart-item-photo">
                            <ProductImage product={p} />
                          </div>
                          <div className="cart-item-info">
                            <div>
                              <h3>{p.name}</h3>
                              <button
                                className="icon-button"
                                aria-label={`Remover ${p.name}`}
                                onClick={() =>
                                  setCart((old) =>
                                    old.filter((x) => x.key !== i.key),
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            {i.extraIds.length > 0 && (
                              <p>
                                {extras
                                  .filter((e) => i.extraIds.includes(e.id))
                                  .map((e) => e.name)
                                  .join(", ")}
                              </p>
                            )}
                            {i.notes && <p>Obs.: {i.notes}</p>}
                            <small>{money(unitPrice(i))} / unidade</small>
                            <div className="cart-item-total">
                              <Quantity
                                value={i.quantity}
                                onChange={(n) =>
                                  setCart((old) =>
                                    old.map((x) =>
                                      x.key === i.key
                                        ? { ...x, quantity: n }
                                        : x,
                                    ),
                                  )
                                }
                              />
                              <strong>
                                {money(unitPrice(i) * i.quantity)}
                              </strong>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <button className="clear-cart" onClick={() => setCart([])}>
                    Esvaziar carrinho <Trash2 size={13} />
                  </button>
                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <strong>{money(subtotal)}</strong>
                    </div>
                    <p>
                      Entrega:{" "}
                      {business.deliveryFee === null
                        ? "taxa a confirmar no checkout"
                        : `${money(business.deliveryFee)} (retirada grátis)`}
                    </p>
                    <div className="total">
                      <span>Total dos produtos</span>
                      <strong>{money(subtotal)}</strong>
                    </div>
                    <button
                      className="button"
                      onClick={() => setCheckout(true)}
                    >
                      FINALIZAR PEDIDO <ArrowRight size={18} />
                    </button>
                    <button
                      className="continue"
                      onClick={() => setDrawer(false)}
                    >
                      Continuar comprando
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
