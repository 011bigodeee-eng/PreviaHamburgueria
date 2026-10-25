# BRASA NOIR

Experiência de hamburgueria gourmet fictícia, construída em **Next.js App Router, React e TypeScript**, com CSS responsivo, animações leves e ícones Lucide. Não há backend nem processamento de pagamentos: o checkout prepara uma mensagem para o cliente enviar pelo WhatsApp.

## Executar

Requer Node.js 20.9+ (validado com Node 24) e npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

No ambiente de nuvem, se o diretório de cache padrão não estiver disponível, use `npm ci --cache /workspace/.npm-cache`.

Para produção:

```bash
npm run build
npm start
```

O servidor usa a porta 3000. Os dados `NEXT_PUBLIC_*` são incorporados ao bundle: reinicie o desenvolvimento após alterar `.env.local` e faça um novo build para produção.

## Configuração comercial

As configurações ficam em `src/config/business.ts`, alimentadas pelas variáveis de `.env.local`:

| Variável | Conteúdo |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origem pública definitiva (incluindo `https://`) para imagens Open Graph. Vazio usa o servidor local; configure antes da publicação comercial. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número internacional autorizado do estabelecimento, somente dígitos, com código do país e DDD. |
| `NEXT_PUBLIC_BUSINESS_ADDRESS` | Endereço completo real, quando disponível. |
| `NEXT_PUBLIC_BUSINESS_HOURS` | Horário de funcionamento. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | URL completa começando com `https://www.instagram.com/`. |
| `NEXT_PUBLIC_DELIVERY_FEE_CENTS` | Taxa fixa em centavos, opcional. `700` corresponde a R$ 7,00; `0` a entrega gratuita. Vazio informa “A confirmar”, sem somar frete ao total. |

**Não há número, endereço ou perfil comercial inventados.** Sem WhatsApp válido, o checkout exibe um resumo demonstrativo e não abre um pedido. Com o número configurado, abre `wa.me` com a mensagem codificada; o cliente precisa enviar e aguardar a confirmação do estabelecimento. Nenhum teste envia pedidos reais.

As informações do checkout permanecem na memória da página; nome, telefone e endereço não são gravados no carrinho persistente. Itens, adicionais e observações do produto são salvos no LocalStorage (`brasa-cart-v1`). O carrinho é mantido após abrir o WhatsApp, já que o site não consegue confirmar o envio. Quando o navegador bloqueia o armazenamento, a compra continua na memória durante a visita.

## Produtos, preços e adicionais

Edite `src/data/menu.ts`. Todos os valores são **inteiros em centavos**. Por exemplo, `3490` = R$ 34,90. O campo `id` deve ser único e estável. Categorias disponíveis: `Burgers`, `Combos`, `Acompanhamentos` e `Bebidas`.

O array `extras` concentra os adicionais. Eles são oferecidos para burgers e cobrados **por unidade**. Dois Noir Classic com bacon extra custam `(3490 + 600) × 2 = 8180`, ou R$ 81,80. Personalizações diferentes ficam em linhas separadas; configurações idênticas são agrupadas. O limite é de 99 unidades por configuração.

## Imagens e identidade visual

O acesso ao Unsplash/Pexels foi bloqueado pela política de rede deste ambiente. Para manter uma prévia visual completa, as imagens atuais são **ilustrações provisórias geradas por IA**, sinalizadas na interface. **Não são fotografias reais de produtos.** Antes de uso comercial, substitua por fotografias próprias ou devidamente licenciadas.

Os arquivos locais otimizados `public/images/burgers.webp` e `sides.webp` são pranchas com seis imagens cada, exibidas por posicionamento CSS. Não há dependência de URLs externas. Cada burger tem sua própria imagem; os combos compartilham uma ilustração de combo.

Para substituir um produto individual, coloque a foto em `public/images/` e adicione ao seu objeto em `src/data/menu.ts`:

```ts
imageUrl: '/images/noir-classic-real.webp',
imageAlt: 'Noir Classic com cheddar, bacon e cebola caramelizada',
```

Fotografias individuais usam `next/image` para otimização. Ajuste os textos de identificação de prévia quando as imagens forem substituídas. Para substituir hero, combo e essência, altere `.hero-food`, `.combo-food` e `.essence-food` em `src/app/globals.css`, usando `background-size: cover` e `background-position: center` na imagem individual. Preserve os textos alternativos correspondentes em `Storefront.tsx`.

Cores, tipografia, breakpoints e animações ficam em `src/app/globals.css`. Barlow Condensed e DM Sans são distribuídas localmente pelos pacotes Fontsource (licenças incluídas nos respectivos pacotes), sem requisições ao Google Fonts. A introdução pode ser pulada, aparece uma vez por sessão e respeita movimento reduzido. O favicon é `public/icon.svg`.

## Organização

- `src/app/`: página, layout, metadata, robots e estilos.
- `src/components/Storefront.tsx`: seções, navegação, cardápio e carrinho.
- `src/components/checkout/Checkout.tsx`: formulário, validação e resumo.
- `src/components/ui/Controls.tsx`: modal com foco gerenciado e seletor de quantidade.
- `src/data/menu.ts`: catálogo, adicionais e cálculos em centavos.
- `src/config/business.ts`: informações comerciais centralizadas.
- `src/lib/order.ts` e `whatsapp.ts`: mensagem e URL de encaminhamento.
- `tests/storefront.spec.ts`: testes de compra, responsividade e acessibilidade.

Os depoimentos são explicitamente demonstrativos. Não há notas verificadas, mapa fictício, API de frete, painel administrativo ou backend. O sitemap deve ser adicionado quando houver domínio público definitivo; metadata, Open Graph básico, favicon e robots já estão presentes. Não foram medidas métricas reais de Core Web Vitals.

## Verificações

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Os testes usam Chromium do sistema quando disponível (`/usr/bin/chromium`), ou o navegador gerenciado pelo Playwright. Em outra máquina, execute `npx playwright install chromium` se necessário; `CHROMIUM_PATH` permite selecionar um executável existente.

A suíte cobre filtros, personalização, agrupamento e separação de itens, valores em centavos, quantidade, remoção, persistência, checkout de entrega/retirada, troco, frete definido e a confirmar, URL e mensagem de WhatsApp, introdução, teclado, axe e larguras de 320/390/430/1440 px. As capturas ficam no diretório ignorado `test-results/`. Os testes nunca enviam pedidos para um estabelecimento.

Antes de disponibilizar comercialmente: substituir as imagens provisórias, configurar os dados reais, revisar produtos e preços e conferir a abertura do WhatsApp com o número autorizado. Publicar a aplicação é uma etapa separada.
