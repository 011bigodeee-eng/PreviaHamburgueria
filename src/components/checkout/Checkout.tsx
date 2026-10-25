"use client";
import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { CartItem, money, unitPrice } from "../../data/menu";
import { business, whatsappReady } from "../../config/business";
import { orderMessage } from "../../lib/order";
import { whatsappUrl } from "../../lib/whatsapp";
export default function Checkout({
  items,
  onBack,
}: {
  items: CartItem[];
  onBack: () => void;
}) {
  const [type, setType] = useState("delivery"),
    [payment, setPayment] = useState("PIX"),
    [needsChange, setNeedsChange] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [preview, setPreview] = useState("");
  const subtotal = items.reduce((s, i) => s + unitPrice(i) * i.quantity, 0),
    fee = type === "delivery" ? business.deliveryFee : 0,
    total = subtotal + (fee || 0);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(
      new FormData(e.currentTarget).entries(),
    ) as Record<string, string>;
    const err: Record<string, string> = {};
    if (data.name.trim().length < 2)
      err.name = "Informe seu nome (ao menos 2 caracteres).";
    if (!/^\d{10,11}$/.test(data.phone.replace(/\D/g, "")))
      err.phone = "Informe um telefone com DDD (10 ou 11 dígitos).";
    if (type === "delivery")
      for (const f of ["address", "number", "district"])
        if (!data[f]?.trim()) err[f] = "Este campo é obrigatório para entrega.";
    if (payment === "Dinheiro" && needsChange) {
      const value = Number((data.change || "").replace(",", "."));
      if (!Number.isFinite(value) || Math.round(value * 100) < total)
        err.change = "Informe um valor igual ou maior que o total.";
    }
    if (!items.length) err.cart = "Adicione produtos antes de finalizar.";
    setErrors(err);
    if (Object.keys(err).length) {
      setTimeout(
        () =>
          document.getElementById(`checkout-${Object.keys(err)[0]}`)?.focus(),
        0,
      );
      return;
    }
    data.type = type;
    data.payment = payment;
    if (!needsChange || payment !== "Dinheiro") data.change = "";
    const message = orderMessage(items, data, business.deliveryFee);
    setPreview(message);
    if (whatsappReady)
      window.open(
        whatsappUrl(business.whatsapp, message)!,
        "_blank",
        "noopener,noreferrer",
      );
  }
  function field(
    name: string,
    label: string,
    required = false,
    inputMode?: "tel" | "decimal",
    placeholder?: string,
  ) {
    return (
      <label className="field" key={name}>
        {label}
        {required ? " *" : ""}
        <input
          id={`checkout-${name}`}
          name={name}
          required={required}
          inputMode={inputMode}
          maxLength={name === "phone" ? 20 : 180}
          autoComplete={
            { name: "name", phone: "tel", address: "street-address" }[name]
          }
          placeholder={placeholder}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `error-${name}` : undefined}
        />
        {errors[name] && (
          <span className="error" id={`error-${name}`}>
            {errors[name]}
          </span>
        )}
      </label>
    );
  }
  return (
    <>
      <button className="back-button" onClick={onBack}>
        ← Voltar ao carrinho
      </button>
      <h2 className="modal-title">
        QUASE NA
        <br />
        <em>SUA MESA.</em>
      </h2>
      <p className="detail-description">
        Confira seus dados. O pedido será enviado por você no WhatsApp e depende
        da confirmação da hamburgueria.
      </p>
      {!whatsappReady && (
        <div className="config-warning">
          <Sparkles size={18} />
          <p>
            <strong>Você está em uma experiência demonstrativa.</strong> O
            WhatsApp do estabelecimento ainda não foi configurado. Você pode
            conferir o resumo, mas nenhum pedido será enviado.
          </p>
        </div>
      )}
      <form onSubmit={submit} noValidate>
        {field("name", "SEU NOME", true)}
        {field("phone", "TELEFONE COM DDD", true, "tel", "(11) 99999-9999")}
        <fieldset className="order-type">
          <legend>COMO VOCÊ QUER RECEBER?</legend>
          <label>
            <input
              type="radio"
              name="deliveryType"
              checked={type === "delivery"}
              onChange={() => setType("delivery")}
            />{" "}
            Entrega
          </label>
          <label>
            <input
              type="radio"
              name="deliveryType"
              checked={type === "pickup"}
              onChange={() => setType("pickup")}
            />{" "}
            Retirada
          </label>
        </fieldset>
        {type === "delivery" && (
          <>
            {field("address", "RUA / AVENIDA", true)}
            <div className="form-row">
              {field("number", "NÚMERO", true)}
              {field("district", "BAIRRO", true)}
            </div>
            {field("complement", "COMPLEMENTO")}
            {field("reference", "PONTO DE REFERÊNCIA")}
          </>
        )}
        <label className="field">
          FORMA DE PAGAMENTO
          <select
            name="payment"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option>PIX</option>
            <option>Cartão na entrega/retirada</option>
            <option>Dinheiro</option>
          </select>
        </label>
        {payment === "Dinheiro" && (
          <>
            <label className="change-check">
              <input
                type="checkbox"
                checked={needsChange}
                onChange={(e) => setNeedsChange(e.target.checked)}
              />{" "}
              Preciso de troco
            </label>
            {needsChange &&
              field("change", "TROCO PARA (R$)", true, "decimal", "100,00")}
          </>
        )}
        <label className="field">
          OBSERVAÇÕES GERAIS
          <textarea name="notes" maxLength={500} />
        </label>
        <div className="cart-summary">
          <div>
            <span>Produtos</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div>
            <span>{type === "delivery" ? "Taxa de entrega" : "Retirada"}</span>
            <span>{fee === null ? "A confirmar" : money(fee)}</span>
          </div>
          <div className="total">
            <span>{fee === null ? "Total sem entrega" : "Total"}</span>
            <strong>{money(total)}</strong>
          </div>
          {errors.cart && (
            <p role="alert" className="error">
              {errors.cart}
            </p>
          )}
          <button className="button" type="submit">
            {whatsappReady
              ? "ABRIR PEDIDO NO WHATSAPP"
              : "CONFERIR RESUMO DEMONSTRATIVO"}
            <ArrowUpRight size={18} />
          </button>
          <p className="demo-note">
            {type === "delivery" && fee === null
              ? "A taxa de entrega será confirmada pela hamburgueria. "
              : ""}
            Seu pedido só é confirmado após a resposta do estabelecimento.
          </p>
        </div>
      </form>
      {Object.keys(errors).length > 0 && (
        <p className="error" role="alert">
          Revise os campos indicados para continuar.
        </p>
      )}
      {preview && (
        <div className="order-preview" role="status">
          <h3>
            {whatsappReady
              ? "Mensagem preparada"
              : "Resumo demonstrativo — não enviado"}
          </h3>
          <pre>{preview}</pre>
          {whatsappReady && (
            <a
              className="button"
              href={whatsappUrl(business.whatsapp, preview)!}
              target="_blank"
              rel="noreferrer"
            >
              ABRIR WHATSAPP <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      )}
    </>
  );
}
