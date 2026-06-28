export type Messenger = "telegram" | "whatsapp" | "phone";
export type LeadInterest =
  | "apartment"
  | "office"
  | "commercial"
  | "parking"
  | "investment"
  | "consultation";

export interface LeadPayload {
  name: string;
  phone: string;
  messenger: Messenger;
  interest: LeadInterest;
  unitId?: string;
  comment?: string;
}

export const messengerOptions: { value: Messenger; label: string }[] = [
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
];

export const interestOptions: { value: LeadInterest; label: string }[] = [
  { value: "apartment", label: "Квартира" },
  { value: "office", label: "Офис" },
  { value: "commercial", label: "Коммерция" },
  { value: "parking", label: "Паркинг" },
  { value: "investment", label: "Инвестиция" },
  { value: "consultation", label: "Консультация" },
];

// ⚠️ SECURITY: on a static site this token ships in the client bundle and is
// visible to anyone. It only lets a sender post to this chat, but it can be
// abused (spam). For production, move the send behind a serverless proxy
// (e.g. Cloudflare Worker) and keep the token server-side.
// Overridable via NEXT_PUBLIC_TG_* env vars.
const TG_BOT_TOKEN =
  process.env.NEXT_PUBLIC_TG_BOT_TOKEN ?? "8701548603:AAGm5oe4YDxVvurBnnAMKePAufTTFPszOog";
const TG_CHAT_ID = process.env.NEXT_PUBLIC_TG_CHAT_ID ?? "-5254382625";

const labelOf = (
  list: { value: string; label: string }[],
  value: string
): string => list.find((o) => o.value === value)?.label ?? value;

function formatLead(p: LeadPayload): string {
  return [
    "🏢 Новая заявка — ASG Towers",
    "",
    `👤 Имя: ${p.name}`,
    `📞 Телефон: ${p.phone}`,
    `💬 Связь: ${labelOf(messengerOptions, p.messenger)}`,
    `🎯 Интерес: ${labelOf(interestOptions, p.interest)}`,
    p.unitId ? `🏠 Объект: ${p.unitId}` : null,
    p.comment ? `📝 Комментарий: ${p.comment}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Sends a lead to the Telegram chat via the bot. */
export async function submitLead(payload: LeadPayload): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text: formatLead(payload),
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.error("[lead] telegram send failed", res.status, detail);
    throw new Error("send_failed");
  }
}
