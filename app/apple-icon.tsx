import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6F3EC"
        }}
      >
        <div style={{ position: "relative", width: 92, height: 92, display: "flex" }}>
          <div style={{ position: "absolute", left: 16, top: 11, width: 16, height: 70, borderRadius: 3, background: "#14151A" }} />
          <div style={{ position: "absolute", left: 16, top: 65, width: 50, height: 16, borderRadius: 3, background: "#14151A" }} />
          <div style={{ position: "absolute", left: 69, top: 15, width: 23, height: 23, borderRadius: "50%", background: "#C2481E" }} />
        </div>
      </div>
    ),
    size
  );
}
