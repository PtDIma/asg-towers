"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  facadeBands,
  facadeImage,
  floorPlans,
  unitPlan,
  unitPlan3d,
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
import { handover } from "@/data/contacts";
import { unitPhotos } from "@/data/unitPhotos";
import { useUI } from "@/hooks/useLeadModal";
import { trackEvent } from "@/lib/analytics";
import { useT } from "@/lib/i18n";
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
  const tr = useT();
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
            {tr("Цены временно недоступны — планировки и площади показаны, стоимость уточните у менеджера.")}
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
  const tr = useT();
  const crumb = "text-[11px] uppercase tracking-[0.18em] transition-colors";
  return (
    <nav className="flex flex-wrap items-center gap-2.5" aria-label={tr("Навигация по выбору")}>
      <button onClick={onHome} className={`${crumb} cursor-pointer ${floor ? "text-white/40 hover:text-white" : "text-gold"}`}>
        {tr("Блок A")}
      </button>
      {floor && (
        <>
          <span className="text-white/20">—</span>
          <button onClick={onFloor} className={`${crumb} cursor-pointer ${unitId ? "text-white/40 hover:text-white" : "text-gold"}`}>
            {tr("2D-план · {n} этаж", { n: floor })}
          </button>
        </>
      )}
      {unitId && (
        <>
          <span className="text-white/20">—</span>
          <span className={`${crumb} text-gold`}>{tr("Квартира {id}", { id: unitId })}</span>
        </>
      )}
    </nav>
  );
}

/* ───────────────────────────── Панель статусов ───────────────────────────── */

function StatusLegend({ counts }: { counts?: Record<UnitStatus, number> }) {
  const tr = useT();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{tr("Статус")}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {(Object.keys(statusLabels) as UnitStatus[]).map((k) => (
          <li
            key={k}
            className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[13px]"
          >
            <span className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: status[k].fill }} />
              <span className="text-white/80">{tr(statusLabels[k])}</span>
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
  const tr = useT();
  const [hover, setHover] = useState<number | null>(null);
  // Подсказка при входе: подсветка один раз пробегает по этажам снизу вверх —
  // сразу видно, что фасад кликабельный. Первое наведение её останавливает.
  const [sweep, setSweep] = useState<number | null>(null);
  useEffect(() => {
    let f = 0;
    const id = window.setInterval(() => {
      f += 1;
      if (f > facadeBands.length) {
        window.clearInterval(id);
        setSweep(null);
      } else setSweep(f);
    }, 70);
    return () => window.clearInterval(id);
  }, []);
  const active = hover ?? sweep;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mt-4"
      aria-label={tr("Выбор этажа")}
    >
      <h1 className="text-[clamp(32px,4vw,58px)] font-semibold leading-[1.02] tracking-tightest">
        {tr("Выберите этаж")}
      </h1>

      <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Здание */}
        {/* На десктопе фасад вписан в высоту экрана — все 15 этажей видны без прокрутки.
            Контейнер обжимает картинку (w-fit), полосы позиционируются от неё. */}
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/40 lg:mx-auto lg:w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={facadeImage} alt={tr("Фасад левой башни")} className="block w-full lg:h-[calc(100svh-200px)] lg:min-h-[560px] lg:w-auto" />

          {facadeBands.map((b) => {
            const on = active === b.floor;
            const fp = floorPlans.find((p) => p.floor === b.floor);
            const free = fp ? countByStatus(fp.units, commercial).available : 0;
            return (
              <button
                key={b.floor}
                onClick={() => onPick(b.floor)}
                onMouseEnter={() => {
                  setSweep(null);
                  setHover(b.floor);
                }}
                onMouseLeave={() => setHover(null)}
                aria-label={tr("{n} этаж, свободно {free}", { n: b.floor, free })}
                className="group absolute cursor-pointer"
                style={{
                  left: `${b.x * 100}%`,
                  width: `${b.w * 100}%`,
                  top: `${b.y * 100}%`,
                  height: `${b.h * 100}%`,
                }}
              >
                <span
                  className="absolute inset-x-0 inset-y-[1px] rounded-[2px] border transition-all duration-200"
                  style={{
                    borderColor: on ? "#C8A96A" : "rgba(214,178,104,0.95)",
                    borderWidth: on ? 2 : 1,
                    background: on ? "rgba(200,169,106,0.55)" : "rgba(200,160,80,0.26)",
                    boxShadow: on ? "0 0 30px rgba(200,169,106,0.45)" : "none",
                  }}
                />
                <span
                  className={`pointer-events-none absolute left-full top-1/2 z-10 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-full font-semibold tabular-nums leading-none transition-all duration-200 sm:ml-2.5 ${
                    on ? "px-2.5 py-[5px] text-[12px] lg:text-[13px]" : "px-1.5 py-[2px] text-[10px] lg:px-2 lg:py-[3px] lg:text-[12px]"
                  }`}
                  style={{
                    background: on ? "#C8A96A" : "rgba(10,10,11,0.72)",
                    color: on ? "#0A0A0B" : "#E6D3A8",
                    boxShadow: on ? "0 4px 18px rgba(200,169,106,0.4)" : "none",
                  }}
                >
                  {on ? tr("{n} этаж · своб. {free}", { n: b.floor, free }) : b.floor}
                </span>
              </button>
            );
          })}

          <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-gold/50 bg-black/70 px-3.5 py-2 text-[12px] font-medium text-white backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            {tr("Нажмите на этаж, чтобы открыть план")}
          </span>
        </div>

        {/* Панель */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{tr("Выберите этаж")}</p>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {facadeBands.map((b) => {
                const plan = floorPlans.find((p) => p.floor === b.floor);
                const free = plan ? countByStatus(plan.units, commercial).available : 0;
                return (
                  <li key={b.floor}>
                    <button
                      onClick={() => onPick(b.floor)}
                      onMouseEnter={() => setHover(b.floor)}
                      onMouseLeave={() => setHover(null)}
                      aria-label={tr("{n} этаж, свободно {free} из {total}", { n: b.floor, free, total: plan?.units.length ?? 0 })}
                      className={`w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                        hover === b.floor
                          ? "border-gold/60 bg-gold/[0.12]"
                          : "border-white/10 bg-white/[0.04] hover:border-gold/40"
                      }`}
                    >
                      <span className="block text-[16px] font-semibold leading-none">{b.floor}</span>
                      <span className="mt-1.5 block text-[11px] leading-none text-white/45">
                        {tr("своб. {free}/{total}", { free, total: plan?.units.length ?? 0 })}
                      </span>
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
  const tr = useT();
  const [hover, setHover] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mt-4"
      aria-label={tr("План {n} этажа", { n: plan.floor })}
    >
      <button
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-gold/50 hover:text-white"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
        {tr("К зданию")}
      </button>

      <h1 className="mt-5 text-[clamp(30px,3.6vw,52px)] font-semibold leading-[1.02] tracking-tightest">
        {tr("{n} этаж", { n: plan.floor })}
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{tr("Этаж")}</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[...floorPlans].reverse().map((p) => (
                <button
                  key={p.floor}
                  onClick={() => onFloorChange(p.floor)}
                  className={`cursor-pointer rounded-xl border px-2 py-2.5 text-[15px] font-semibold tabular-nums transition-all duration-200 ${
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

    </motion.section>
  );
}

/** План с контурами квартир: SVG поверх растра, координаты — доли изображения. */
/**
 * Сколько места вокруг якоря метки внутри контура квартиры (доли плана):
 * ближайшие пересечения горизонтали и вертикали через якорь с контуром.
 * Метка центрирована на якоре, поэтому берём меньшую из сторон.
 */
function labelRoom(u: ApartmentGeo, W: number, H: number) {
  const ring = u.poly[0];
  const x0 = u.nx * W;
  const y0 = u.ny * H;
  let left = Infinity, right = Infinity, up = Infinity, down = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[(i + 1) % ring.length];
    const x1 = ax * W, y1 = ay * H, x2 = bx * W, y2 = by * H;
    if ((y1 - y0) * (y2 - y0) <= 0 && y1 !== y2) {
      const x = x1 + ((y0 - y1) / (y2 - y1)) * (x2 - x1);
      if (x <= x0) left = Math.min(left, x0 - x);
      else right = Math.min(right, x - x0);
    }
    if ((x1 - x0) * (x2 - x0) <= 0 && x1 !== x2) {
      const y = y1 + ((x0 - x1) / (x2 - x1)) * (y2 - y1);
      if (y <= y0) up = Math.min(up, y0 - y);
      else down = Math.min(down, y - y0);
    }
  }
  return { w: (2 * Math.min(left, right)) / W, h: (2 * Math.min(up, down)) / H };
}

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
  const tr = useT();
  const { width: W, height: H } = plan;

  // Метки не должны залезать на соседей: каждую ужимаем до места внутри своей
  // квартиры. Меряем естественный размер (offset* не видит transform) и ширину плана.
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [planW, setPlanW] = useState(0);
  const [fit, setFit] = useState<Record<string, number>>({});
  const rooms = useMemo(() => new Map(plan.units.map((u) => [u.id, labelRoom(u, W, H)])), [plan, W, H]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPlanW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!planW) return;
    const planH = (planW * H) / W;
    const next: Record<string, number> = {};
    for (const u of plan.units) {
      const el = labelRefs.current[u.id];
      const r = rooms.get(u.id);
      if (!el || !r) continue;
      const k = Math.min(1, (0.9 * r.w * planW) / el.offsetWidth, (0.9 * r.h * planH) / el.offsetHeight);
      next[u.id] = Math.max(0.45, k);
    }
    setFit(next);
  }, [planW, plan, rooms, commercial, W, H, tr]);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 560 }}>
      <div ref={boxRef} className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={plan.image} alt={tr("Планировка {n} этажа", { n: plan.floor })} className="block w-full" />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          role="group"
          aria-label={tr("Квартиры на плане")}
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
                aria-label={tr("Квартира {id}, {area} м², {status}", { id: u.id, area: u.area, status: tr(statusLabels[st]) })}
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
          const info = commercial.get(u.id);
          const st = info?.status ?? "available";
          const on = hover === u.id || activeId === u.id;
          const m2 = st !== "sold" ? info?.priceM2 : undefined;
          return (
            <button
              key={u.id}
              ref={(el) => {
                labelRefs.current[u.id] = el;
              }}
              onMouseEnter={() => onHover(u.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onPick(u.id)}
              tabIndex={-1}
              aria-hidden
              className="absolute cursor-pointer whitespace-nowrap rounded-[10px] px-2 py-1 text-center leading-none shadow-sm transition-transform duration-150"
              style={{
                left: `${u.nx * 100}%`,
                top: `${u.ny * 100}%`,
                background: on ? "#0A0A0B" : "rgba(255,255,255,0.94)",
                color: on ? "#fff" : "#111",
                // При наведении метка вырастает до читаемого размера — поверх соседей можно.
                transform: `translate(-50%,-50%) scale(${on ? Math.max(1, fit[u.id] ?? 1) * 1.06 : fit[u.id] ?? 1})`,
                zIndex: on ? 10 : 1,
              }}
            >
              <span className="block text-[11px] font-bold">{u.id}</span>
              <span className="mt-0.5 block text-[9.5px] font-medium opacity-70">
                {u.area} {tr("м²")}
              </span>
              {m2 && (
                <span className="mt-0.5 block text-[9.5px] font-semibold" style={{ color: on ? "#E6D3A8" : "#8A6A2E" }}>
                  ${m2.toLocaleString("ru-RU")}/{tr("м²")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Над рекой — какой этаж сейчас открыт. */}
      <div className="flex justify-center pb-2 pt-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0B] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-md">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
            <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
            <path d="m3 12 9 4.5 9-4.5" />
            <path d="m3 16.5 9 4.5 9-4.5" />
          </svg>
          {tr("{n} этаж", { n: plan.floor })}
        </span>
      </div>

      {/* Река под планом: нижние квартиры смотрят на Куру — так это видно сразу. */}
      <svg viewBox="0 0 560 64" className="block w-full" aria-label={tr("Река Кура")} role="img">
        <path
          d="M0 14 C 50 4, 90 24, 140 14 S 230 4, 280 14 S 370 24, 420 14 S 510 4, 560 14 L 560 64 L 0 64 Z"
          fill="#B9DBF2"
        />
        <path d="M0 30 C 60 22, 100 38, 160 30 S 260 22, 320 30 S 440 38, 560 28" fill="none" stroke="#86BFE6" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 46 C 80 40, 120 52, 170 46 M300 48 C 350 42, 400 54, 450 47" fill="none" stroke="#9ACBEC" strokeWidth="2" strokeLinecap="round" />
        <text x="280" y="44" textAnchor="middle" fontSize="12" letterSpacing="3" fill="#3A7FAE" fontWeight="600">
          {tr("КУРА")}
        </text>
      </svg>
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
  const tr = useT();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
        {tr("Квартиры этажа")}
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
                <span className="w-11 shrink-0 text-[14px] font-semibold tabular-nums">
                  {u.id}
                </span>
                <span className="shrink-0 text-[13px] text-white/60 tabular-nums">
                  {u.area} {tr("м²")}
                </span>
                <span className="ml-auto text-[13px] text-white/80 tabular-nums">
                  {st === "sold" ? "—" : tr(formatPrice(info?.price))}
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
  const tr = useT();
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
          aria-label={tr("Закрыть")}
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
                alt={tr("Квартира {id} в объёме", { id: unit.id })}
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
              {tr(statusLabels[st])}
            </span>
            <h2 className="mt-4 text-[32px] font-semibold leading-none tracking-tightest">
              {tr("Квартира {id}", { id: unit.id })}
            </h2>
            <p className="mt-2 text-[14px] text-white/50">
              {tr("{n} этаж · сдача {handover}", { n: unit.floor, handover: tr(handover) })}
            </p>

            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 text-[14px]">
              <div>
                <dt className="text-white/40">{tr("Общая площадь")}</dt>
                <dd className="mt-1 text-[21px] font-semibold">
                  {unit.area} {tr("м²")}
                </dd>
              </div>
              <div>
                <dt className="text-white/40">{tr("Стоимость")}</dt>
                <dd className="mt-1 text-[21px] font-semibold">
                  {sold ? "—" : tr(formatPrice(info?.price))}
                </dd>
              </div>
              {info?.rooms && (
                <div>
                  <dt className="text-white/40">{tr("Комнат")}</dt>
                  <dd className="mt-1">{tr(info.rooms)}</dd>
                </div>
              )}
              {info?.view && (
                <div>
                  <dt className="text-white/40">{tr("Вид")}</dt>
                  <dd className="mt-1">{tr(info.view)}</dd>
                </div>
              )}
              {!sold && (info?.priceM2 || info?.price) && (
                <div>
                  <dt className="text-white/40">{tr("За м²")}</dt>
                  <dd className="mt-1">
                    {/* Колонка price_m2 — источник истины, если её нет — считаем сами. */}
                    {formatPrice(
                      Math.round(info.priceM2 ?? info.price! / unit.area)
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {sold && (
              <p className="mt-6 text-[14px] text-white/55">
                {tr("Эта квартира продана. Подберём похожую — оставьте заявку.")}
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
              {tr(sold ? "Подобрать похожую" : "Оставить заявку")}
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
/**
 * Планировка квартиры лентой: 3D → фото интерьера → 2D-чертёж.
 * Листается свайпом, стрелками по бокам и вкладками сверху. Открывается
 * первым слайдом — 3D с мебелью понятнее покупателю, чертёж в конце.
 */
type Slide = { kind: "3d" | "photo" | "2d"; src: string };

function UnitPlanWithLabels({ unit }: { unit: ApartmentGeo }) {
  const tr = useT();
  const src3d = unitPlan3d(unit);
  const slides = useMemo<Slide[]>(
    () => [
      ...(src3d ? [{ kind: "3d" as const, src: src3d }] : []),
      ...unitPhotos(unit.plan).map((src) => ({ kind: "photo" as const, src })),
      { kind: "2d" as const, src: unitPlan(unit) },
    ],
    [unit, src3d]
  );

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const swipeX = useRef<number | null>(null);

  // Новая квартира — с первого слайда, иначе индекс «прилипает» от прошлой.
  useEffect(() => setIdx(0), [unit.id]);

  const go = (n: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, n));
    if (next === idx) return;
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };

  const cur = slides[Math.min(idx, slides.length - 1)];
  const photoCount = slides.filter((s) => s.kind === "photo").length;
  const photoNo = cur.kind === "photo" ? slides.indexOf(cur) - (src3d ? 1 : 0) + 1 : 0;

  const tabs = [
    { kind: "3d" as const, label: "3D" },
    { kind: "photo" as const, label: tr("Фото") },
    { kind: "2d" as const, label: "2D" },
  ].filter((t) => slides.some((s) => s.kind === t.kind));

  const alt =
    cur.kind === "3d"
      ? tr("Квартира {id} — объёмная планировка", { id: unit.id })
      : cur.kind === "photo"
        ? tr("Квартира {id} — фото {n}", { id: unit.id, n: photoNo })
        : tr("Квартира {id} — чертёж", { id: unit.id });

  return (
    <div className="relative flex w-full flex-col items-center">
      {tabs.length > 1 && (
        <div className="mb-3 inline-flex rounded-full bg-black/[0.06] p-1">
          {tabs.map((t) => (
            <button
              key={t.kind}
              onClick={() => go(slides.findIndex((s) => s.kind === t.kind))}
              aria-pressed={cur.kind === t.kind}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
                cur.kind === t.kind ? "bg-[#0A0A0B] text-white" : "text-[#0A0A0B]/55 hover:text-[#0A0A0B]"
              }`}
            >
              {t.label}
              {t.kind === "photo" && photoCount > 1 && (
                <span className="ml-1 opacity-60">{cur.kind === "photo" ? `${photoNo}/${photoCount}` : photoCount}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Высота фиксирована: фото широкие, чертежи бывают узкими — без неё карточка прыгает. */}
      <div
        className="relative flex h-[38vh] w-full touch-pan-y select-none items-center justify-center overflow-hidden sm:h-[370px]"
        onPointerDown={(e) => {
          swipeX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeX.current === null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) < 40) return;
          go(idx + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          swipeX.current = null;
        }}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            key={cur.src}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease }}
            draggable={false}
            src={cur.src}
            alt={alt}
            className={`max-h-full max-w-full object-contain ${cur.kind === "photo" ? "rounded-xl" : ""}`}
          />
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => go(idx - 1)}
              disabled={idx === 0}
              aria-label="←"
              className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#0A0A0B] shadow-md backdrop-blur transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => go(idx + 1)}
              disabled={idx === slides.length - 1}
              aria-label="→"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#0A0A0B] shadow-md backdrop-blur transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {slides.length > 2 && (
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {slides.map((s, i) => (
            <span
              key={s.src}
              className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "w-4 bg-[#0A0A0B]" : "w-1.5 bg-black/20"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
