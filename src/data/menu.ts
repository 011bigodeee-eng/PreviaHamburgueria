export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  /** Optional local photograph in public/, e.g. /images/noir-classic.webp. */
  imageUrl?: string;
  imageAlt?: string;
  tag?: string;
};
export const products: Product[] = [
  {
    id: "classic",
    name: "Noir Classic",
    price: 3490,
    category: "Burgers",
    description:
      "Blend bovino artesanal de 160g, cheddar cremoso, bacon crocante, cebola caramelizada e molho secreto da casa.",
    image: "classic",
    tag: "ASSINATURA DA CASA",
  },
  {
    id: "inferno",
    name: "Inferno Double",
    price: 4690,
    category: "Burgers",
    description:
      "Dois smash burgers de 100g, cheddar duplo, bacon defumado, picles artesanal e maionese levemente picante.",
    image: "inferno",
    tag: "PARA QUEM GOSTA DE FOGO",
  },
  {
    id: "truffle",
    name: "Black Truffle",
    price: 5290,
    category: "Burgers",
    description:
      "Blend premium de 180g, queijo especial, cogumelos salteados, maionese trufada e pão brioche.",
    image: "truffle",
    tag: "INTENSAMENTE PREMIUM",
  },
  {
    id: "smoke",
    name: "Smoke House",
    price: 4390,
    category: "Burgers",
    description:
      "Blend de 180g, queijo prato, bacon defumado, cebola crispy e barbecue artesanal.",
    image: "smoke",
  },
  {
    id: "supreme",
    name: "Brasa Supreme",
    price: 4990,
    category: "Burgers",
    description:
      "Blend de 200g, cheddar, bacon, cebola roxa, alface e molho especial.",
    image: "supreme",
  },
  {
    id: "combo-noir",
    name: "Combo Noir",
    price: 4990,
    category: "Combos",
    description: "Noir Classic, batata individual e refrigerante lata.",
    image: "combo",
  },
  {
    id: "combo-inferno",
    name: "Combo Inferno",
    price: 6290,
    category: "Combos",
    description: "Inferno Double, batata individual e refrigerante lata.",
    image: "combo",
  },
  {
    id: "fries",
    name: "Fritas da Casa",
    price: 1790,
    category: "Acompanhamentos",
    description: "Batatas crocantes com tempero especial.",
    image: "fries",
  },
  {
    id: "cheddar-fries",
    name: "Cheddar & Bacon Fries",
    price: 2690,
    category: "Acompanhamentos",
    description: "Batatas com cheddar cremoso e bacon.",
    image: "cheddar-fries",
  },
  {
    id: "soda",
    name: "Refrigerante Lata",
    price: 790,
    category: "Bebidas",
    description: "Lata 350 ml. Informe sua preferência nas observações.",
    image: "soda",
  },
  {
    id: "water",
    name: "Água Mineral",
    price: 590,
    category: "Bebidas",
    description: "Água mineral 500 ml.",
    image: "water",
  },
  {
    id: "shake",
    name: "Milkshake de Chocolate",
    price: 1990,
    category: "Bebidas",
    description: "Cremoso, intenso e feito para acompanhar sua obsessão.",
    image: "shake",
  },
];
export const extras = [
  { id: "cheddar", name: "Cheddar extra", price: 500 },
  { id: "bacon", name: "Bacon extra", price: 600 },
  { id: "meat", name: "Carne extra", price: 1200 },
  { id: "sauce", name: "Molho especial", price: 300 },
];
export type CartItem = {
  key: string;
  productId: string;
  quantity: number;
  extraIds: string[];
  notes: string;
};
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value / 100,
  );
export function unitPrice(item: CartItem) {
  const p = products.find((p) => p.id === item.productId)!;
  return (
    p.price +
    extras
      .filter((e) => item.extraIds.includes(e.id))
      .reduce((s, e) => s + e.price, 0)
  );
}
