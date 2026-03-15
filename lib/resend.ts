/**
 * Resend wrapper – skickar alertmail till info@importguiden.se
 * Kräver miljövariabeln RESEND_API_KEY
 */

export async function sendAlert(subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[resend] RESEND_API_KEY saknas – mail skickas ej");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Importguiden <info@importguiden.se>",
      to: ["info@importguiden.se"],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[resend] Misslyckades att skicka mail:", error);
    throw new Error(`Resend API-fel: ${response.status}`);
  }

  console.log(`[resend] Mail skickat: ${subject}`);
}
