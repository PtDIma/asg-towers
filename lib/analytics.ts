// Analytics placeholders.
// TODO: подключить Google Analytics (gtag), Meta Pixel (fbq) и CRM-события.

type EventName =
  | "cta_click"
  | "unit_card_click"
  | "lead_submit"
  | "plans_tab_click"
  | "lead_modal_open";

export function trackEvent(
  event: EventName,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.log(`[analytics] ${event}`, payload);

  // TODO: window.gtag?.("event", event, payload);
  // TODO: window.fbq?.("trackCustom", event, payload);
}
