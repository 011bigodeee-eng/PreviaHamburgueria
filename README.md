# Acordeon Hamburgueria

Experiência web da Acordeon Hamburgueria, construída em **Next.js App Router, React e TypeScript**, com CSS responsivo, animações leves e ícones Lucide. Não há backend nem processamento de pagamentos: o checkout prepara uma mensagem para o cliente enviar pelo WhatsApp.

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

Fotografias individuais usam `next/image` para otimização. Ajuste os textos de identificação de prévia quando as imagens forem substituídas. A imagem principal independente está em `public/images/brasa-noir-hero-poster.webp` e usa `next/image`. Substitua esse arquivo e ajuste o texto alternativo em `src/components/home/HeroVideo.tsx` quando houver uma fotografia real. Para substituir combo e essência, altere `.combo-food` e `.essence-food` em `src/app/redesign.css`, usando `background-size: cover` e `background-position: center` na imagem individual. Preserve os textos alternativos correspondentes em `Storefront.tsx`.

Os estilos base e os controles ficam em `src/app/globals.css`. A direção visual editorial, com papel, carvão e cobre, está em `src/app/redesign.css`. Barlow Condensed e DM Sans são distribuídas localmente pelos pacotes Fontsource (licenças incluídas nos respectivos pacotes), sem requisições ao Google Fonts. A introdução pode ser pulada, aparece uma vez por sessão e respeita movimento reduzido. O favicon é `public/icon.svg`.

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
npm run test:unit
npm test
```

Os testes usam Chromium do sistema quando disponível (`/usr/bin/chromium`), ou o navegador gerenciado pelo Playwright. Em outra máquina, execute `npx playwright install chromium` se necessário; `CHROMIUM_PATH` permite selecionar um executável existente.

A suíte cobre filtros, personalização, agrupamento e separação de itens, valores em centavos, quantidade, remoção, persistência, checkout de entrega/retirada, troco, frete definido e a confirmar, URL e mensagem de WhatsApp, introdução, teclado, axe e larguras de 320/390/430/1440 px. As capturas ficam no diretório ignorado `test-results/`. Os testes nunca enviam pedidos para um estabelecimento.

Antes de disponibilizar comercialmente: substituir as imagens provisórias, configurar os dados reais, revisar produtos e preços e conferir a abertura do WhatsApp com o número autorizado. Publicar a aplicação é uma etapa separada.

## Publicação na Vercel

O arquivo `vercel.json` declara o framework Next.js, instalação com `npm ci`, build com `npm run build` e diretório de saída `.next`. Importe este repositório com a branch de produção `main`. Como o aplicativo está na raiz do repositório, deixe **Root Directory** vazio (raiz). Não selecione `src`, `public` ou um diretório de exportação estática.

As variáveis comerciais são configuradas em **Settings → Environment Variables**. Após alterações, faça um novo deployment. Defina `NEXT_PUBLIC_SITE_URL` com a URL pública definitiva para compartilhamento. Se um deployment antigo foi criado antes da implementação do Next.js, publique novamente usando o commit mais recente da `main`.

## Hero cinematográfico — integração pronta, vídeo pendente

O hero agora integra uma cena sem moldura de card, com poster estático otimizado e entradas de texto em Motion. **O vídeo real da montagem camada por camada ainda não existe no repositório.** Não foi produzido um vídeo 4K nem uma montagem fictícia com CSS. O poster atual é a imagem de IA reaproveitada da versão anterior; não representa a sequência animada solicitada.

Para ativar a cena, adicione `public/videos/brasa-noir-hero.webm` e/ou `public/videos/brasa-noir-hero.mp4` e faça novo build/deployment. O poster fica em `public/images/brasa-noir-hero-poster.webp`; ele já existe como fallback provisório e deve ser substituído por um frame correspondente ao material final. Os arquivos opcionais `brasa-noir-hero-mobile.webm` e `brasa-noir-hero-mobile.mp4` usam o mesmo diretório. O guia detalhado de produção, sequência dos ingredientes, codecs e otimização fica em `public/videos/README.md`.

`src/lib/hero-media.server.ts` detecta no build apenas arquivos existentes e não vazios; arquivos ausentes não geram requisições 404. `src/config/hero.ts` centraliza os caminhos. `HeroVideo.tsx` mantém a imagem sob o vídeo até a reprodução, trata erros por fonte, tenta o formato alternativo, oferece pausa/reprodução e pausa fora da tela ou em aba oculta. Uma espera prolongada volta ao poster. Com movimento reduzido, nenhum elemento de vídeo é montado e nenhum arquivo é solicitado. O layout reserva espaço e usa `object-fit: contain` para não cortar ingredientes. A duração de 6–9 segundos, o realismo da montagem e o encaixe do loop precisam estar no arquivo final.

Os estilos específicos estão em `src/app/cinematic-hero.css`; o restante do catálogo, carrinho e checkout foi preservado. `npm run test:unit` valida descoberta de arquivos e o ciclo de vida do player com APIs de mídia simuladas. Esses testes **não** validam decodificação de um vídeo real, sua qualidade cinematográfica ou o loop final. A suíte de navegador também confere o fallback sem requisições para vídeos ausentes.

A marca exibida no site, nos metadados e nas mensagens de pedido é **Acordeon Hamburgueria**, centralizada em `src/config/business.ts`. Identificadores técnicos antigos de arquivos e armazenamento foram preservados para manter compatibilidade com a configuração e os carrinhos existentes.

## Refinamento do hero e header

A composição atual mantém a marca **Acordeon Hamburgueria**, com título em três níveis, contraste serifado na palavra “fogo”, reveal vertical em Motion e entrada curta dos CTAs. No mobile, o burger ocupa uma linha própria antes dos botões; no desktop, permanece à direita. Header e navegação compactam em tablets, preservam o link ativo e indicam o carrinho. “Fazer meu pedido” leva ao cardápio quando o carrinho está vazio e reabre o pedido já iniciado quando há itens.

O aviso técnico “PRÉVIA ESTÁTICA · VÍDEO A ADICIONAR” foi removido da interface pública. O poster ilustrativo atual foi preservado; **não há arquivos de vídeo ativos no checkout após a reversão solicitada**. Os caminhos e o player com fallback continuam preparados conforme o guia de mídia, e vídeos novos exigem build/deployment. Essa alteração não restaura o vídeo anteriormente removido.

Arquivos principais desta composição: `src/components/home/CinematicHero.tsx`, `HeroVideo.tsx`, `src/app/cinematic-hero.css` e a ligação com o header/carrinho em `src/components/Storefront.tsx`. Catálogo, preços e checkout foram preservados.
