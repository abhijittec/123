import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/config";

export const alt = `${EVENT.title} invitation`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "radial-gradient(circle at 20% 20%, #4a2378 0%, transparent 40%), radial-gradient(circle at 80% 10%, #e8913a55 0%, transparent 35%), linear-gradient(160deg, #070b18 0%, #0b1226 50%, #1a0f2e 100%)",
          color: "#f7efd8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            color: "#e8913a",
            textTransform: "uppercase",
          }}
        >
          {EVENT.apartment}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 64,
            fontWeight: 700,
            color: "#e7c56b",
          }}
        >
          Happy Diwali 2026
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 30,
            color: "#f4df9b",
          }}
        >
          {EVENT.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 24,
            color: "#c9b896",
          }}
        >
          {EVENT.taglineSupport}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 24,
            color: "#c9b896",
          }}
        >
          {EVENT.weekday}, {EVENT.dateLabel} · {EVENT.timeLabel}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 22,
            color: "#c9b896",
          }}
        >
          {EVENT.venue}
        </div>
      </div>
    ),
    { ...size },
  );
}
