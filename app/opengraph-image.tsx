import { ImageResponse } from "next/og";

export const alt =
  "Importguiden – oberoende guide till privat fordonsimport från EU till Sverige";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Standard-OG-bild för hela sajten. Genereras vid bygge via next/og.
 * Följer färgpaletten i CLAUDE.md (blue-700, gray-900, gray-600, white).
 * Inga gradients, ingen kampanjfärg.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "72px",
          borderTop: "16px solid #1d4ed8",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#1d4ed8",
              letterSpacing: "-0.5px",
              marginBottom: 28,
            }}
          >
            Importguiden.se
          </div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.15,
              letterSpacing: "-2px",
            }}
          >
            Importera bil eller husbil från Europa
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#4b5563",
              marginTop: 24,
              lineHeight: 1.4,
            }}
          >
            Oberoende, källhänvisade guider och gratis importkalkylator
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: 24,
            color: "#4b5563",
          }}
        >
          {["Steg för steg", "Aktuella kostnader", "Ingen säljagenda"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px 20px",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
