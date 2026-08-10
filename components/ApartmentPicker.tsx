"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  facadeBands,
  facadeImage,
  floorPlans,
  unitPlan,
  type ApartmentGeo,
  type FloorPlan,
} from "@/data/apartments";
import {
  fetchUnitCommercials,
  formatPrice,
  statusLabels,
  type UnitCommercial,
  type UnitStatus,
} from "@/lib/units-sheet";
import { useUI } from "@/hooks/useLeadModal";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/Button";
import { ArrowRight, ArrowDown, Close } from "@/components/icons";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Цвета статусов. Зелёный/янтарный/серый читаются мгновенно — это инструмент
 * продаж, тут узнаваемость важнее чистоты золотой палитры бренда.
 */
const status = {
  available: { fill: "#5FBF8B", label: "#7FD6A6", chip: "bg-[#5FBF8B]/15 text-[#7FD6A6] ring-1 ring-[#5FBF8B]/40" },
  reserved: { fill: "#D9A441", label: "#E8BC6B", chip: "bg-[#D9A441]/15 text-[#E8BC6B] ring-1 ring-[#D9A441]/40" },
  sold: { fill: "#6B6B6B", label: "#9A9A9A", chip: "bg-white/8 text-white/45 ring-1 ring-white/15" },
} satisfies Record<UnitStatus, { fill: string; label: string; chip: string }>;

export function ApartmentPicker() {
  const [floor, setFloor] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [commercial, setCommercial] = useState<Map<string, UnitCommercial>>(new Map());
  const [sheetError, setSheetError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchUnitCommercials()
      .then((m) => alive && setCommercial(m))
      .catch(() => alive && setSheetError(true));
    return () => {
      alive = false;
    };
  }, []);

  const plan = floorPlans.find((p) => p.floor === floor) ?? null;
  const unit = useMemo(
    () => plan?.units.find((u) => u.id === unitId) ?? null,
    [plan, unitId]
  );

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] pb-24 pt-20 text-white lg:pt-24">
      {/* Мягкое золотое свечение вверху — отделяет страницу от плоского чёрного */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.16]"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, #C8A96A 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1500px] px-5 lg:px-10">
        <Breadcrumb
          floor={floor}
          unitId={unitId}
          onHome={() => {
            setFloor(null);
            setUnitId(null);
          }}
          onFloor={() => setUnitId(null)}
        />

        {sheetError && (
          <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] text-white/60">
            Цены временно недоступны — планировки и площади показаны, стоимость уточните у менеджера.
          </p>
        )}

        {!plan ? (
          <FacadeStep onPick={setFloor} commercial={commercial} />
        ) : (
          <FloorStep
            plan={plan}
            commercial={commercial}
            activeId={unitId}
            onPick={setUnitId}
            onFloorChange={setFloor}
            onBack={() => setFloor(null)}
          />
        )}
      </div>

      <AnimatePresence>
        {unit && (
          <UnitSheet
            unit={unit}
            info={commercial.get(unit.id)}
            onClose={() => setUnitId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────── Крошки ───────────────────────────── */

function Breadcrumb({
  floor,
  unitId,
  onHome,
  onFloor,
}: {
  floor: number | null;
  unitId: string | null;
  onHome: () => void;
  onFloor: () => void;
}) {
  const crumb = "text-[11px] uppercase tracking-[0.18em] transition-colors";
  return (
    <nav className="flex flex-wrap items-center gap-2.5" aria-label="Навигация по выбору">
      <button onClick={onHome} className={`${crumb} cursor-pointer ${floor ? "text-white/40 hover:text-white" : "text-gold"}`}>
        Блок A
      </button>
      {floor && (
        <>
          <span className="text-white/20">—</span>
          <button onClick={onFloor} className={`${crumb} cursor-pointer ${unitId ? "text-white/40 hover:text-white" : "text-gold"}`}>
            2D-план · {floor} этаж
          </button>
        </>
      )}
      {unitId && (
        <>
          <span className="text-white/20">—</span>
          <span className={`${crumb} text-gold`}>Квартира {unitId}</span>
        </>
      )}
    </nav>
  );
}

/* ───────────────────────────── Панель статусов ───────────────────────────── */

function StatusLegend({ counts }: { counts?: Record<UnitStatus, number> }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Статус</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {(Object.keys(statusLabels) as UnitStatus[]).map((k) => (
          <li
            key={k}
            className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[13px]"
          >
            <span className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: status[k].fill }} />
              <span className="text-white/80">{statusLabels[k]}</span>
            </span>
            {counts && <span className="text-white/40 tabular-nums">{counts[k]}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function countByStatus(
  units: ApartmentGeo[],
  commercial: Map<string, UnitCommercial>
): Record<UnitStatus, number> {
  const acc: Record<UnitStatus, number> = { available: 0, reserved: 0, sold: 0 };
  for (const u of units) acc[commercial.get(u.id)?.status ?? "available"]++;
  return acc;
}

/* ───────────────────────────── Шаг 1: здание ───────────────────────────── */

function FacadeStep({
  onPick,
  commercial,
}: {
  onPick: (floor: number) => void;
  commercial: Map<string, UnitCommercial>;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mt-4"
      aria-label="Выбор этажа"
    >
      <h1 className="text-[clamp(32px,4vw,58px)] font-semibold leading-[1.02] tracking-tightest">
        Выберите этаж
      </h1>
      <p className="mt-3 max-w-[54ch] text-[15px] leading-[1.5] text-white/55">
        Левая башня, блок A. Открыты первые два жилых этажа — по девять квартир
        на каждом.
      </p>

      <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Здание */}
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={facadeImage} alt="Фасад левой башни" className="block w-full" />

          {facadeBands.map((b) => {
            const on = hover === b.floor;
            return (
              <button
                key={b.floor}
                onClick={() => onPick(b.floor)}
                onMouseEnter={() => setHover(b.floor)}
                onMouseLeave={() => setHover(null)}
                aria-label={`${b.floor} этаж, отметка ${b.level}`}
                className="group absolute cursor-pointer"
                style={{
                  left: `${b.x * 100}%`,
                  width: `${b.w * 100}%`,
                  top: `calc(${b.y * 100}% - 11px)`,
                  height: `calc(${b.h * 100}% + 22px)`,
                }}
              >
                <span
                  className="absolute inset-x-0 bottom-[11px] top-[11px] rounded-[3px] border transition-all duration-200"
                  style={{
                    borderColor: on ? "#C8A96A" : "rgba(200,169,106,0.55)",
                    borderWidth: on ? 2 : 1.5,
                    background: on ? "rgba(200,169,106,0.36)" : "rgba(200,169,106,0.14)",
                    boxShadow: on ? "0 0 30px rgba(200,169,106,0.45)" : "none",
                  }}
                />
                <span
                  className="absolute left-full top-1/2 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200"
                  style={{
                    background: on ? "#C8A96A" : "rgba(10,10,11,0.82)",
                    color: on ? "#0A0A0B" : "#C8A96A",
                    boxShadow: on ? "0 4px 18px rgba(200,169,106,0.4)" : "none",
                  }}
                >
                  {b.floor} этаж
                </span>
              </button>
            );
          })}

          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/60 backdrop-blur">
            Наведите на этаж
          </span>
        </div>

        {/* Панель */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Выберите этаж</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {facadeBands.map((b) => {
                const plan = floorPlans.find((p) => p.floor === b.floor);
                const free = plan
                  ? countByStatus(plan.units, commercial).available
                  : 0;
                return (
                  <li key={b.floor}>
                    <button
                      onClick={() => onPick(b.floor)}
                      onMouseEnter={() => setHover(b.floor)}
                      onMouseLeave={() => setHover(null)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                        hover === b.floor
                          ? "border-gold/60 bg-gold/[0.12]"
                          : "border-white/10 bg-white/[0.04] hover:border-gold/40"
                      }`}
                    >
                      <span>
                        <span className="block text-[17px] font-semibold">{b.floor} этаж</span>
                        <span className="mt-0.5 block text-[12px] text-white/45">
                          9 квартир · свободно {free} · отм. {b.level}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <StatusLegend
            counts={countByStatus(
              floorPlans.flatMap((p) => p.units),
              commercial
            )}
          />
        </div>
      </div>
    </motion.section>
  );
}

/* ───────────────────────────── Шаг 2: план этажа ───────────────────────────── */

function FloorStep({
  plan,
  commercial,
  activeId,
  onPick,
  onFloorChange,
  onBack,
}: {
  plan: FloorPlan;
  commercial: Map<string, UnitCommercial>;
  activeId: string | null;
  onPick: (id: string) => void;
  onFloorChange: (f: number) => void;
  onBack: () => void;
}) {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mt-4"
      aria-label={`План ${plan.floor} этажа`}
    >
      <button
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-gold/50 hover:text-white"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
        К зданию
      </button>

      <h1 className="mt-5 text-[clamp(30px,3.6vw,52px)] font-semibold leading-[1.02] tracking-tightest">
        {plan.floor} этаж
      </h1>

      <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="rounded-[20px] border border-white/10 bg-white p-4 sm:p-6">
          <PlanSvg
            plan={plan}
            commercial={commercial}
            hover={hover}
            activeId={activeId}
            onHover={setHover}
            onPick={onPick}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Этаж</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {floorPlans.map((p) => (
                <button
                  key={p.floor}
                  onClick={() => onFloorChange(p.floor)}
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-[15px] font-semibold transition-all duration-200 ${
                    p.floor === plan.floor
                      ? "border-gold bg-gold text-ink"
                      : "border-white/10 bg-white/[0.04] text-white/80 hover:border-gold/40"
                  }`}
                >
                  {p.floor}
                </button>
              ))}
            </div>
          </div>

          <StatusLegend counts={countByStatus(plan.units, commercial)} />

          <UnitList
            plan={plan}
            commercial={commercial}
            hover={hover}
            onHover={setHover}
            onPick={onPick}
          />
        </div>
      </div>

      {plan.units.some((u) => u.areaDerived) && (
        <p className="mt-6 text-[12px] text-white/35">
          * площадь не подписана в чертеже, посчитана как студия + балкон + санузел — уточняется.
        </p>
      )}
    </motion.section>
  );
}

/** План с контурами квартир: SVG поверх растра, координаты — доли изображения. */
function PlanSvg({
  plan,
  commercial,
  hover,
  activeId,
  onHover,
  onPick,
}: {
  plan: FloorPlan;
  commercial: Map<string, UnitCommercial>;
  hover: string | null;
  activeId: string | null;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  const { width: W, height: H } = plan;

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 560 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={plan.image} alt={`Планировка ${plan.floor} этажа`} className="block w-full" />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        role="group"
        aria-label="Квартиры на плане"
      >
        {plan.units.map((u) => {
          const st = commercial.get(u.id)?.status ?? "available";
          const c = status[st];
          const on = hover === u.id || activeId === u.id;
          return (
            <g
              key={u.id}
              className="cursor-pointer"
              onMouseEnter={() => onHover(u.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onPick(u.id)}
              role="button"
              tabIndex={0}
              aria-label={`Квартира ${u.id}, ${u.area} м², ${statusLabels[st]}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(u.id);
                }
              }}
            >
              {u.poly.map((ring, i) => (
                <polygon
                  key={i}
                  points={ring.map(([x, y]) => `${x * W},${y * H}`).join(" ")}
                  fill={c.fill}
                  fillOpacity={on ? 0.62 : 0.34}
                  stroke={c.fill}
                  strokeWidth={on ? 9 : 5}
                  strokeLinejoin="round"
                  style={{ transition: "fill-opacity 160ms, stroke-width 160ms" }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Метки — обычным DOM: так текст не масштабируется вместе с планом */}
      {plan.units.map((u) => {
        const st = commercial.get(u.id)?.status ?? "available";
        const on = hover === u.id || activeId === u.id;
        return (
          <button
            key={u.id}
            onMouseEnter={() => onHover(u.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onPick(u.id)}
            tabIndex={-1}
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-full px-2 py-1 text-center leading-none shadow-sm transition-transform duration-150"
            style={{
              left: `${u.nx * 100}%`,
              top: `${u.ny * 100}%`,
              background: on ? "#0A0A0B" : "rgba(255,255,255,0.94)",
              color: on ? "#fff" : "#111",
              transform: `translate(-50%,-50%) scale(${on ? 1.08 : 1})`,
            }}
          >
            <span className="block text-[11px] font-bold">{u.id}</span>
            <span className="mt-0.5 block text-[9.5px] font-medium opacity-70">
              {u.area} м²
            </span>
          </button>
        );
      })}
    </div>
  );
}

function UnitList({
  plan,
  commercial,
  hover,
  onHover,
  onPick,
}: {
  plan: FloorPlan;
  commercial: Map<string, UnitCommercial>;
  hover: string | null;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
        Квартиры этажа
      </p>
      <ul className="mt-4 flex flex-col gap-1.5">
        {plan.units.map((u) => {
          const info = commercial.get(u.id);
          const st = info?.status ?? "available";
          const on = hover === u.id;
          return (
            <li key={u.id}>
              <button
                onClick={() => onPick(u.id)}
                onMouseEnter={() => onHover(u.id)}
                onMouseLeave={() => onHover(null)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                  on ? "bg-white/[0.10]" : "hover:bg-white/[0.06]"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: status[st].fill }}
                />
                <span className="w-8 shrink-0 text-[14px] font-semibold tabular-nums">
                  {u.id}
                </span>
                <span className="shrink-0 text-[13px] text-white/60 tabular-nums">
                  {u.area} м²
                  {u.areaDerived && <span className="text-gold/70">*</span>}
                </span>
                <span className="ml-auto text-[13px] text-white/80 tabular-nums">
                  {st === "sold" ? "—" : formatPrice(info?.price)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────────────────────────── Шаг 3: карточка ───────────────────────────── */

function UnitSheet({
  unit,
  info,
  onClose,
}: {
  unit: ApartmentGeo;
  info?: UnitCommercial;
  onClose: () => void;
}) {
  const { openLead } = useUI();
  const st = info?.status ?? "available";
  const sold = st === "sold";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        transition={{ duration: 0.32, ease }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-t-[26px] border border-white/10 bg-[#141416] sm:rounded-[26px]"
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <Close className="h-4 w-4" />
        </button>

        <div className="grid sm:grid-cols-[1.05fr_1fr]">
          <div className="relative flex w-full items-center justify-center overflow-hidden bg-white p-5 sm:min-h-[440px] sm:p-7">
            {info?.renderUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={info.renderUrl}
                alt={`Квартира ${unit.id} в объёме`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              /* Нарезанный план квартиры. Пропорции у них разные — от узкой
                 полосы 0.29 до широкой 1.5, поэтому вписываем, а не обрезаем. */
              <UnitPlanWithLabels unit={unit} />
            )}
          </div>

          <div className="p-6 sm:p-8">
            <span className={`inline-block rounded-full px-3 py-1 text-[12px] ${status[st].chip}`}>
              {statusLabels[st]}
            </span>
            <h2 className="mt-4 text-[32px] font-semibold leading-none tracking-tightest">
              Квартира {unit.id}
            </h2>
            <p className="mt-2 text-[14px] text-white/50">
              {unit.floor} этаж · левая башня, блок A
            </p>

            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 text-[14px]">
              <div>
                <dt className="text-white/40">Общая площадь</dt>
                <dd className="mt-1 text-[21px] font-semibold">
                  {unit.area} м²
                  {unit.areaDerived && <span className="ml-1 text-[13px] text-gold/70">*</span>}
                </dd>
              </div>
              <div>
                <dt className="text-white/40">Стоимость</dt>
                <dd className="mt-1 text-[21px] font-semibold">
                  {sold ? "—" : formatPrice(info?.price)}
                </dd>
              </div>
              {info?.rooms && (
                <div>
                  <dt className="text-white/40">Комнат</dt>
                  <dd className="mt-1">{info.rooms}</dd>
                </div>
              )}
              {info?.view && (
                <div>
                  <dt className="text-white/40">Вид</dt>
                  <dd className="mt-1">{info.view}</dd>
                </div>
              )}
              {!sold && (info?.priceM2 || info?.price) && (
                <div>
                  <dt className="text-white/40">За м²</dt>
                  <dd className="mt-1">
                    {/* Колонка price_m2 — источник истины, если её нет — считаем сами. */}
                    {formatPrice(
                      Math.round(info.priceM2 ?? info.price! / unit.area)
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {unit.areaDerived && (
              <p className="mt-4 text-[12px] leading-snug text-white/35">
                * площадь не подписана в чертеже и уточняется у застройщика.
              </p>
            )}

            {sold && (
              <p className="mt-6 text-[14px] text-white/55">
                Эта квартира продана. Подберём похожую — оставьте заявку.
              </p>
            )}

            <Button
              variant="primary"
              block
              className="mt-6"
              onClick={() => {
                trackEvent("cta_click", { label: "unit:lead", unitId: unit.id });
                openLead({ interest: "apartment", unitId: unit.id, source: "unit-card" });
              }}
            >
              {sold ? "Подобрать похожую" : "Оставить заявку"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Нарезка квартиры с подписями комнат поверх. Подписи — DOM, а не пиксели:
 * остаются чёткими при любом размере и не зависят от языка чертежа.
 * Позиционируются от реального бокса картинки, а не контейнера — при
 * object-contain они отличаются на величину полей.
 */
function UnitPlanWithLabels({ unit }: { unit: ApartmentGeo }) {
  return (
    <div className="relative flex w-full items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={unitPlan(unit.id)}
        alt={`Планировка квартиры ${unit.id}`}
        className="max-h-[46vh] w-auto max-w-full object-contain sm:max-h-[400px]"
      />
    </div>
  );
}
