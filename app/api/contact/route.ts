import { NextRequest, NextResponse } from "next/server";
import { sendAlert } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  let name: string, email: string, message: string;

  try {
    const body = await req.json();
    name = String(body.name ?? "").trim();
    email = String(body.email ?? "").trim();
    message = String(body.message ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan" }, { status: 400 });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Alla fält krävs" }, { status: 400 });
  }

  // Grundläggande e-postvalidering
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ogiltig e-postadress" }, { status: 400 });
  }

  try {
    await sendAlert(
      `[Importguiden] Kontaktformulär från ${name}`,
      [`Namn: ${name}`, `E-post: ${email}`, "", "Meddelande:", message].join("\n")
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Misslyckades att skicka mail:", err);
    return NextResponse.json({ error: "Kunde inte skicka meddelandet" }, { status: 500 });
  }
}
