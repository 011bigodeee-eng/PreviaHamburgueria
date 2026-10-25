import { CartItem, extras, money, products, unitPrice } from "../data/menu";
export function orderMessage(
  items: CartItem[],
  data: Record<string, string>,
  fee: number | null,
) {
  const subtotal = items.reduce((s, i) => s + unitPrice(i) * i.quantity, 0);
  return [
    "🍔 NOVO PEDIDO — BRASA NOIR",
    `Cliente: ${data.name}`,
    `Telefone: ${data.phone}`,
    `Tipo: ${data.type === "delivery" ? "Entrega" : "Retirada"}`,
    "PEDIDO:",
    ...items.map((i) => {
      const p = products.find((p) => p.id === i.productId)!;
      return `${i.quantity}x ${p.name} — ${money(unitPrice(i) * i.quantity)}\nPreço unitário com adicionais: ${money(unitPrice(i))}${
        i.extraIds.length
          ? "\nAdicionais: " +
            extras
              .filter((e) => i.extraIds.includes(e.id))
              .map((e) => `${e.name} (${money(e.price)} / unidade)`)
              .join(", ")
          : ""
      }${i.notes ? "\nObservação: " + i.notes : ""}`;
    }),
    `Subtotal: ${money(subtotal)}`,
    data.type === "delivery"
      ? `Entrega: ${fee === null ? "A confirmar" : money(fee)}`
      : "Retirada no local",
    `Total${data.type === "delivery" && fee === null ? " sem taxa de entrega" : ""}: ${money(subtotal + (data.type === "delivery" ? fee || 0 : 0))}`,
    data.type === "delivery"
      ? `Endereço: ${data.address}, ${data.number}\nBairro: ${data.district}\nComplemento: ${data.complement || "—"}\nReferência: ${data.reference || "—"}`
      : "",
    `Pagamento: ${data.payment}`,
    data.change ? `Troco para: ${data.change}` : "",
    `Observações gerais: ${data.notes || "—"}`,
    "Aguardo a confirmação do pedido!",
  ]
    .filter(Boolean)
    .join("\n\n");
}
