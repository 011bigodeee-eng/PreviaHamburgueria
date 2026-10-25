# Vídeo do hero — integrado

Material de origem: `zsky-39d5607c.mp4`, enviado pelo usuário. Original: H.264, 1280×720, 24 fps, 6,863 s e áudio AAC. O anexo original foi preservado. Não é um arquivo 4K nem uma animação CSS.

## Arquivos servidos

- `brasa-noir-hero.webm`: VP9, 1280×720, 24 fps, ~6,334 s, ~1,37 MB.
- `brasa-noir-hero.mp4`: H.264/yuv420p, fast-start, 1280×720, 24 fps, ~6,333 s, ~2,01 MB.
- `../images/brasa-noir-hero-poster.webp`: frame extraído do original em 4,8 s, com o burger montado.

As duas versões de vídeo não têm trilha de áudio. O player mantém `muted`, `autoPlay`, `playsInline` e `loop`, respeita movimento reduzido e permite pausa. O poster aparece durante carregamento, erro ou bloqueio de autoplay. Vídeos são pausados fora da área visível e em aba oculta. Formatos alternativos e erros foram testados em Chromium com os arquivos reais; Safari/iOS físico não foi testado.

## Edição aplicada para o loop

O original termina com uma cartela “zsky.ai”. A versão de exibição usa somente a montagem até 4,95 s, desacelerada por 1,35×. Uma dissolução de 0,375 s entre final e início prepara a repetição sem a cartela. Nenhum ingrediente foi gerado ou simulado pelo site. A composição 16:9 original foi preservada; o site não aplica crop ao vídeo. A integração não modifica os cortes e movimentos já presentes na gravação enviada.

Receita reproduzível com FFmpeg (execute na raiz do projeto; substitua `SOURCE.mp4` pelo anexo original):

```bash
FILTER='[0:v]trim=end=4.95,setpts=1.35*(PTS-STARTPTS),fps=24,split=2[a][b];[a]trim=start=0.375,setpts=PTS-STARTPTS,fps=24[body];[b]trim=end=0.375,setpts=PTS-STARTPTS,fps=24[head];[body][head]xfade=transition=fade:duration=0.375:offset=5.958333,format=yuv420p[v]'
ffmpeg -i SOURCE.mp4 -filter_complex_threads 2 -filter_complex "$FILTER" -map '[v]' -an -c:v libx264 -crf 21 -preset slow -threads 2 -movflags +faststart public/videos/brasa-noir-hero.mp4
ffmpeg -i SOURCE.mp4 -filter_complex_threads 2 -filter_complex "$FILTER" -map '[v]' -an -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -threads 2 public/videos/brasa-noir-hero.webm
ffmpeg -ss 4.8 -i SOURCE.mp4 -frames:v 1 -c:v libwebp -quality 85 public/images/brasa-noir-hero-poster.webp
```

Para outro master, ajuste duração e posição da dissolução à montagem; não reutilize estes tempos automaticamente. A duração, sequência dos ingredientes e qualidade do loop dependem da edição do arquivo, não são criadas pelo componente.

## Trocar ou adicionar mídia

Mantenha os mesmos nomes e faça novo `npm run build`/deployment. Arquivos opcionais `brasa-noir-hero-mobile.webm` e `brasa-noir-hero-mobile.mp4` podem ser adicionados se houver um novo enquadramento autorizado para celular; atualmente o mesmo material é usado sem recorte em desktop e mobile.

O servidor inclui somente caminhos de arquivos existentes e não vazios no manifesto do build. Se os vídeos forem removidos, o hero continua com poster estático. Se WebM não for reproduzido, MP4 é a alternativa nativa do navegador. Não existe solicitação a arquivos que não foram adicionados ao repositório.
