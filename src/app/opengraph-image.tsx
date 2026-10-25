import { ImageResponse } from "next/og";
import { business } from "../config/business";
export const alt = `${business.name} — Fire. Flavor. Obsession.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#080808",
        color: "#f5f2ed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        borderBottom: "12px solid #ff5a1f",
      }}
    >
      <div
        style={{
          color: "#ff5a1f",
          fontSize: 20,
          letterSpacing: 6,
          marginBottom: 35,
        }}
      >
        FIRE. FLAVOR. OBSESSION.
      </div>
      <div
        style={{
          fontSize: 115,
          fontWeight: 900,
          letterSpacing: -5,
          display: "flex",
        }}
      >
        ACORDEON
      </div>
      <div
        style={{
          color: "#e7ad77",
          fontSize: 35,
          letterSpacing: 12,
          display: "flex",
          marginTop: 10,
        }}
      >
        HAMBURGUERIA
      </div>
      <div style={{ fontSize: 27, marginTop: 40, color: "#bdb3a9" }}>
        NÃO É APENAS UM BURGER. É UMA OBSESSÃO.
      </div>
    </div>,
    size,
  );
}
