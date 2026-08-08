/**
 * Цены и статусы квартир из Google Sheets.
 *
 * Таблица — источник истины по коммерции: менеджер правит цену, через минуту
 * она на сайте, без пересборки. Геометрия и площади живут в data/apartments.ts
 * и приходят из чертежа — таблица их не переопределяет.
 *
 * Лист должен быть открыт по ссылке («Доступ по ссылке — читатель»).
 * Эндпоint gviz отдаёт CORS-заголовки, поэтому статический сайт читает его
 * прямо из браузера.
 */

const SHEET_ID = "1Rpdi-bSkweYvIGtQksYtBP72VveKQzZbH7ifg_B1Mz8";
const SHEET_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export type UnitStatus = "available" | "reserved" | "sold";

export interface UnitCommercial {
  id: string;
  status: UnitStatus;
  /** USD. undefined — цена не указана (обычно у проданных). */
  price?: number;
  /** USD за м². Если в таблице нет — считаем из price и площади. */
  priceM2?: number;
  rooms?: string;
  view?: string;
  /** Объёмная картинка квартиры. Пока пусто — показываем фрагмент плана. */
  renderUrl?: string;
}

export const statusLabels: Record<UnitStatus, string> = {
  available: "Свободна",
  reserved: "Бронь",
  sold: "Продана",
};

/** Минимальный парсер CSV: кавычки, экранированные кавычки, переводы строк в ячейках. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim()));
}

/** Коды видов из таблицы — в человеческий текст. Незнакомое отдаём как есть. */
const viewLabels: Record<string, string> = {
  river: "На реку",
  yard: "Во двор",
  city: "На город",
  street: "На улицу",
};

function viewLabel(raw: string): string | undefined {
  const v = raw.trim();
  if (!v) return undefined;
  return viewLabels[v.toLowerCase()] ?? v;
}

function toStatus(raw: string): UnitStatus {
  const v = raw.trim().toLowerCase();
  if (v.startsWith("sold") || v.startsWith("прода")) return "sold";
  if (v.startsWith("reserv") || v.startsWith("брон")) return "reserved";
  return "available";
}

/**
 * Число из ячейки. Терпит "$86 500", "86,500", "86 500 USD", "1408,45".
 *
 * Запятая и точка бывают и разделителем разрядов, и десятичным: лист в русской
 * локали пишет "42,6", а в английской то же число — "42.6". Различаем по длине
 * хвоста: ровно 3 цифры после последнего разделителя и других разделителей нет
 * — это разряды (86,500), иначе десятичная часть (1408,450704). Без этого
 * "1408,450704" превращается в 1408450704.
 */
function toNumber(raw: string): number | undefined {
  const s = raw.replace(/[^\d.,]/g, "");
  if (!s) return undefined;

  const lastSep = Math.max(s.lastIndexOf(","), s.lastIndexOf("."));
  let normalized: string;
  if (lastSep === -1) {
    normalized = s;
  } else {
    const tail = s.slice(lastSep + 1);
    const sepCount = (s.match(/[.,]/g) ?? []).length;
    const isThousands = tail.length === 3 && sepCount === 1 && s.length > 4;
    normalized = isThousands
      ? s.replace(/[.,]/g, "")
      : s.slice(0, lastSep).replace(/[.,]/g, "") + "." + tail;
  }

  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Тянет коммерческие данные. Возвращает Map по номеру квартиры.
 * Бросает — вызывающий сам решает, показать ли страницу без цен.
 */
export async function fetchUnitCommercials(): Promise<Map<string, UnitCommercial>> {
  const res = await fetch(SHEET_CSV, { cache: "no-store" });
  if (!res.ok) throw new Error(`sheet_http_${res.status}`);

  const rows = parseCsv(await res.text());
  const out = new Map<string, UnitCommercial>();
  if (!rows.length) return out;

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const iId = col("id");
  if (iId === -1) throw new Error("sheet_no_id_column");

  const iStatus = col("status");
  const iPrice = col("price");
  const iPriceM2 = col("price_m2");
  const iRooms = col("rooms");
  const iView = col("view");
  const iRender = col("render_url");

  for (const r of rows.slice(1)) {
    const id = (r[iId] ?? "").trim();
    if (!id) continue;
    out.set(id, {
      id,
      status: iStatus === -1 ? "available" : toStatus(r[iStatus] ?? ""),
      price: iPrice === -1 ? undefined : toNumber(r[iPrice] ?? ""),
      priceM2: iPriceM2 === -1 ? undefined : toNumber(r[iPriceM2] ?? ""),
      rooms: iRooms === -1 ? undefined : (r[iRooms] ?? "").trim() || undefined,
      view: iView === -1 ? undefined : viewLabel(r[iView] ?? ""),
      renderUrl: iRender === -1 ? undefined : (r[iRender] ?? "").trim() || undefined,
    });
  }
  return out;
}

export function formatPrice(price?: number): string {
  if (!price) return "Цена по запросу";
  return "$" + price.toLocaleString("ru-RU").replace(/,/g, " ");
}
