import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Manual 01 "Iconografía" (p.5): explicit exception to the icon library --
// the app icon/favicon is built by isolating the gold "i" from the
// "Bellezista" wordmark itself, on the brand's soft-black surface for
// legibility at small sizes.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C2C2A",
          borderRadius: 6,
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 24,
          color: "#CDA306",
        }}
      >
        i
      </div>
    ),
    { ...size }
  );
}
