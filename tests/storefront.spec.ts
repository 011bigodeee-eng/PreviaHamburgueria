import { test, expect } from "@playwright/test";

test("personalização, cálculo em centavos, persistência e checkout demonstrativo", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Adicionar Noir Classic", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel(/Bacon extra/).check();
  await dialog.getByRole("button", { name: "Aumentar quantidade" }).click();
  await dialog.getByLabel("OBSERVAÇÕES", { exact: true }).fill("Sem cebola");
  await expect(
    dialog.getByRole("button", { name: /ADICIONAR ·/ }),
  ).toContainText("81,80");
  await dialog.getByRole("button", { name: /ADICIONAR ·/ }).click();
  await page.getByRole("button", { name: "Abrir carrinho, 2 itens" }).click();
  dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Bacon extra");
  await expect(dialog).toContainText("Sem cebola");
  await expect(dialog.getByText("R$ 81,80", { exact: true })).toHaveCount(3);
  await dialog.getByRole("button", { name: "Fechar janela" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Abrir carrinho, 2 itens" }).click();
  await page
    .getByRole("button", { name: "FINALIZAR PEDIDO", exact: true })
    .click();
  await page
    .getByRole("button", { name: "CONFERIR RESUMO DEMONSTRATIVO" })
    .click();
  await expect(
    page.getByText("Informe seu nome (ao menos 2 caracteres)."),
  ).toBeVisible();
  await page.getByLabel("SEU NOME").fill("Maria Teste");
  await page.getByLabel("TELEFONE COM DDD").fill("11999999999");
  await page.getByLabel("RUA / AVENIDA").fill("Rua de Teste");
  await page.getByLabel("NÚMERO", { exact: false }).fill("123");
  await page.getByLabel("BAIRRO").fill("Centro");
  await page
    .getByRole("button", { name: "CONFERIR RESUMO DEMONSTRATIVO" })
    .click();
  await expect(
    page.getByText("Resumo demonstrativo — não enviado"),
  ).toBeVisible();
  const summary = page.locator(".order-preview pre");
  await expect(summary).toContainText("2x Noir Classic — R$ 81,80");
  await expect(summary).toContainText("Entrega: A confirmar");
  await expect(summary).toContainText("Bacon extra (R$ 6,00 / unidade)");
  await expect(summary).toContainText("Rua de Teste, 123");
  expect(errors).toEqual([]);
});

test("filtros, configurações distintas, quantidade, remoção e carrinho vazio", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bebidas", exact: true }).click();
  await expect(page.locator(".menu-item")).toHaveCount(3);
  await expect(page.locator(".menu-item").first()).toContainText(
    "Refrigerante Lata",
  );
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await expect(page.locator(".menu-item")).toHaveCount(12);
  for (const note of ["Sem cebola", "Com cebola"]) {
    await page
      .getByRole("button", { name: "Adicionar Noir Classic", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("OBSERVAÇÕES", { exact: true })
      .fill(note);
    await page.getByRole("button", { name: /ADICIONAR ·/ }).click();
  }
  await page.getByRole("button", { name: "Abrir carrinho, 2 itens" }).click();
  await expect(page.locator(".cart-item")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Aumentar quantidade" })
    .first()
    .click();
  await expect(page.locator(".cart-summary .total")).toContainText("104,70");
  await page
    .getByRole("button", { name: "Diminuir quantidade" })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Remover Noir Classic" })
    .first()
    .click();
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Esvaziar carrinho" }).click();
  await expect(page.getByText("A brasa está esperando.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "FINALIZAR PEDIDO", exact: true }),
  ).toHaveCount(0);
});

test("retirada dispensa endereço e dinheiro exige troco suficiente", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Adicionar Fritas da Casa", exact: true })
    .click();
  await page.getByRole("button", { name: /ADICIONAR ·/ }).click();
  await page.getByRole("button", { name: "Abrir carrinho, 1 itens" }).click();
  await page
    .getByRole("button", { name: "FINALIZAR PEDIDO", exact: true })
    .click();
  await page.getByLabel("SEU NOME").fill("Cliente Teste");
  await page.getByLabel("TELEFONE COM DDD").fill("11999999999");
  await page.getByRole("radio", { name: "Retirada", exact: true }).check();
  await expect(page.getByLabel("RUA / AVENIDA")).toHaveCount(0);
  await page.getByLabel("FORMA DE PAGAMENTO").selectOption("Dinheiro");
  await page.getByLabel("Preciso de troco").check();
  await page.getByLabel("TROCO PARA").fill("10");
  await page
    .getByRole("button", { name: "CONFERIR RESUMO DEMONSTRATIVO" })
    .click();
  await expect(
    page.getByText("Informe um valor igual ou maior que o total."),
  ).toBeVisible();
  await page.getByLabel("TROCO PARA").fill("20,00");
  await page
    .getByRole("button", { name: "CONFERIR RESUMO DEMONSTRATIVO" })
    .click();
  await expect(page.locator(".order-preview pre")).toContainText(
    "Tipo: Retirada",
  );
  await expect(page.locator(".order-preview pre")).toContainText(
    "Troco para: 20,00",
  );
});

for (const width of [320, 390, 430, 1440])
  test(`layout sem overflow e navegação em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width < 760) {
      await page
        .getByRole("button", { name: "Abrir menu", exact: true })
        .click();
      await page
        .getByRole("navigation", { name: "Navegação mobile" })
        .getByRole("link", { name: "Cardápio" })
        .click();
      await expect(
        page.getByRole("navigation", { name: "Navegação mobile" }),
      ).toHaveCount(0);
    }
    await page.screenshot({
      path: `test-results/brasa-${width}.png`,
      fullPage: true,
    });
  });

test("acessibilidade da página e do modal; foco retorna ao botão de origem", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const opener = page.getByRole("button", {
    name: "Adicionar Noir Classic",
    exact: true,
  });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("introdução pode ser pulada e aparece uma vez por sessão", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "Pular introdução" }).click();
  await expect(page.locator(".intro")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".intro")).toHaveCount(0);
});

test("mensagem inclui frete definido e URL do WhatsApp preserva acentos e valores", async () => {
  const { orderMessage } = await import("../src/lib/order");
  const { whatsappUrl } = await import("../src/lib/whatsapp");
  const message = orderMessage(
    [
      {
        key: "test",
        productId: "classic",
        quantity: 2,
        extraIds: ["bacon"],
        notes: "Sem cebola & picles",
      },
    ],
    {
      name: "João",
      phone: "11999999999",
      type: "delivery",
      address: "Rua São José",
      number: "42",
      district: "Centro",
      payment: "PIX",
    },
    700,
  );
  expect(message.replaceAll("\u00a0", " ")).toContain("Subtotal: R$ 81,80");
  expect(message.replaceAll("\u00a0", " ")).toContain("Entrega: R$ 7,00");
  expect(message.replaceAll("\u00a0", " ")).toContain("Total: R$ 88,80");
  // Structurally valid fixture; no network request is made.
  const url = new URL(whatsappUrl("5500000000000", message)!);
  expect(url.hostname).toBe("wa.me");
  expect(url.searchParams.get("text")).toBe(message);
  expect(whatsappUrl("", message)).toBeNull();
});

test("fluxo de compra mobile e recuperação de armazenamento inválido", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("brasa-cart-v1", "invalid-json"),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Adicionar Inferno Double", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("OBSERVAÇÕES", { exact: true })
    .fill("Pouca pimenta");
  await page.getByRole("button", { name: /ADICIONAR ·/ }).click();
  await page.locator(".mobile-cart").click();
  await expect(page.getByRole("dialog")).toContainText("Pouca pimenta");
  await page
    .getByRole("button", { name: "FINALIZAR PEDIDO", exact: true })
    .click();
  await expect(page.getByLabel("SEU NOME")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("hero cinematográfico sem mídia usa poster e não solicita vídeos inexistentes", async ({
  page,
}) => {
  const videoRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm)(\?|$)/.test(request.url()))
      videoRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".cinema-poster")).toBeVisible();
  await expect(page.locator(".cinema-caption")).toContainText(
    "PRÉVIA ESTÁTICA",
  );
  await expect(page.locator(".cinema-scene video")).toHaveCount(0);
  expect(videoRequests).toEqual([]);
  await expect(
    page.getByRole("link", { name: "EXPLORAR CARDÁPIO", exact: true }),
  ).toHaveAttribute("href", "#cardapio");
  await expect(
    page.getByRole("link", { name: "FAZER MEU PEDIDO", exact: true }),
  ).toHaveAttribute("href", "#cardapio");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".cinema-scene video")).toHaveCount(0);
});
