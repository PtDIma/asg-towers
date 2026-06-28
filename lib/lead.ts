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

/**
 * Sends a lead. For now logs to console.
 * TODO: подключить Telegram Bot API / CRM / Google Sheets через серверный route.
 */
export async function submitLead(payload: LeadPayload): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("[lead] submitLead", payload);

  // Simulate network latency so the UI loading state is visible.
  await new Promise((resolve) => setTimeout(resolve, 900));

  // TODO: await fetch("/api/lead", { method: "POST", body: JSON.stringify(payload) });
}
