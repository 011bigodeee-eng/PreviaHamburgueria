import type { Metadata } from "next";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";
import "./redesign.css";
import "./cinematic-hero.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: { icon: "/icon.svg" },
  title: "BRASA NOIR — Fire. Flavor. Obsession.",
  description:
    "Fogo de verdade, ingredientes selecionados e burgers artesanais. Conheça sua próxima obsessão. Marca fictícia — experiência demonstrativa.",
  openGraph: {
    title: "BRASA NOIR",
    description: "Não é apenas um burger. É uma obsessão.",
    locale: "pt_BR",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
