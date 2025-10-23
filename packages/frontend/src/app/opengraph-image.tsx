import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Obsidian Protocol - Universal Credit for All Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "linear-gradient(to bottom right, #9333ea, #3b82f6, #9333ea)",
        backgroundSize: "100% 100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "20px",
          padding: "60px",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            background: "linear-gradient(to right, #e879f9, #60a5fa)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Obsidian Protocol
        </h1>

        <p
          style={{
            fontSize: "32px",
            color: "#ffffff",
            marginBottom: "40px",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Universal Credit for All Intelligence
        </p>

        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(to right, #3b82f6, #60a5fa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              👤
            </div>
            <span style={{ fontSize: "24px", color: "#ffffff" }}>Humans</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(to right, #9333ea, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🤖
            </div>
            <span style={{ fontSize: "24px", color: "#ffffff" }}>
              AI Agents
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: "20px",
            color: "#a78bfa",
            marginTop: "40px",
            textAlign: "center",
          }}
        >
          Built on Solana • 0% Collateral for AI • Powered by SAS
        </p>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
