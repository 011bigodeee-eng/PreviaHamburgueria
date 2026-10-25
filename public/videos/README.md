# Mídia cinematográfica pendente

Nenhum vídeo foi fornecido ou criado nesta implementação. A cena de montagem real não está concluída; o site usa o poster estático enquanto os arquivos estão ausentes.

Adicione aqui o material final autorizado:

- `brasa-noir-hero.webm` — VP9/WebM otimizado.
- `brasa-noir-hero.mp4` — H.264/MP4, pixel format yuv420p, fast-start; fallback importante para Safari/iOS.
- Opcional: `brasa-noir-hero-mobile.webm` e `brasa-noir-hero-mobile.mp4`, com enquadramento para celular.

Poster: `public/images/brasa-noir-hero-poster.webp`. O atual é uma ilustração de IA provisória, reaproveitada da versão anterior. Substitua pelo frame final do vídeo e atualize sua descrição no componente `HeroVideo.tsx` quando houver material real.

Direção da cena de 6–9 segundos, câmera praticamente fixa, fundo #080808, luz quente lateral, sem texto nem áudio:
1. Pão inferior fixo e centralizado.
2. Alface desce e pousa no pão.
3. Tomate pousa sobre a alface.
4. Carne alta e grelhada pousa sobre o tomate.
5. Anéis de cebola roxa se acomodam sobre a carne.
6. Pão brioche superior desce e fecha o burger.

Os ingredientes devem desacelerar naturalmente, com peso, sem cortes indesejados. Reserve margens para a montagem inteira; o player usa `object-fit: contain`. A transição entre último e primeiro frame deve ser resolvida na edição do vídeo, não simulada pelo site. Não inclua um arquivo vazio, um vídeo aleatório ou uma animação CSS no lugar desse material.

Exporte uma versão web, não o master 4K. Recomenda-se 1440×1080 ou enquadramento equivalente no desktop, 720–960 px no mobile, 24/30 fps e poucos MB por formato. Ajuste bitrate e resolução inspecionando detalhes e tempo de carregamento, sem tratar esses números como requisito rígido. Se o material original já estiver disponível, um exemplo de conversão MP4 com FFmpeg é:

```bash
ffmpeg -i master.mov -an -vf 'scale=1440:-2' -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -movflags +faststart brasa-noir-hero.mp4
```

Depois de adicionar/remover arquivos, faça um novo `npm run build` e publique o commit. O servidor detecta no build somente arquivos existentes e não vazios; nenhum URL de vídeo ausente é enviado ao navegador. Em desenvolvimento, recarregue a página. Se houver apenas MP4, ele é usado sozinho; quando há os dois formatos, WebM tem prioridade com fallback de formato nativo para MP4.

A integração mantém poster visível no carregamento, na falha ou no bloqueio de autoplay. Sem movimento reduzido, tenta autoplay mudo, inline e em loop; permite pausar/reproduzir, pausa fora de vista e em aba oculta. Em movimento reduzido, não monta o elemento de vídeo nem solicita seu arquivo. Não há sincronização rígida entre texto e vídeo. A duração, a sequência dos ingredientes e a qualidade do loop dependem do arquivo fornecido, não podem ser garantidas pelo player.
