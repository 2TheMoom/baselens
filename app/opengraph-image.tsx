import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFraunces() {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Fraunces:wght@700")
    ).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fraunces = await loadFraunces();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6F3EC",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, background: "#C2481E" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", width: 104, height: 104, display: "flex" }}>
            <div style={{ position: "absolute", left: 17, top: 12, width: 19, height: 80, borderRadius: 4, background: "#14151A" }} />
            <div style={{ position: "absolute", left: 17, top: 73, width: 57, height: 19, borderRadius: 4, background: "#14151A" }} />
            <div style={{ position: "absolute", left: 78, top: 17, width: 26, height: 26, borderRadius: "50%", background: "#C2481E" }} />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 118,
              fontWeight: 700,
              color: "#14151A",
              fontFamily: fraunces ? "Fraunces" : "serif",
              letterSpacing: "-2.5px"
            }}
          >
            baselens
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 28,
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "#726F68",
            fontFamily: "monospace"
          }}
        >
          Base Upgrade Intelligence
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fraunces ? [{ name: "Fraunces", data: fraunces, weight: 700 as const, style: "normal" as const }] : []
    }
  );
}
