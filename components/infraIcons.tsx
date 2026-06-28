import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

function Cart(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M3 4h2l2.2 11h9.6l1.9-8H6.2" />
      <circle cx="9" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}
function Coffee(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 8h11v4.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 12.5V8Z" />
      <path d="M16 9h2.2a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 3.5v2M11.5 3.5v2" />
    </svg>
  );
}
function Dumbbell(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M4 9v6M7 6.5v11M17 6.5v11M20 9v6M7 12h10" />
    </svg>
  );
}
function Waves(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M3 8c1.8 0 1.8 1.6 3.6 1.6S8.4 8 10.2 8s1.8 1.6 3.6 1.6S15.6 8 17.4 8 19.2 9.6 21 9.6" />
      <path d="M3 13c1.8 0 1.8 1.6 3.6 1.6S8.4 13 10.2 13s1.8 1.6 3.6 1.6S15.6 13 17.4 13 19.2 14.6 21 14.6" />
      <path d="M3 18c1.8 0 1.8 1.6 3.6 1.6S8.4 18 10.2 18s1.8 1.6 3.6 1.6S15.6 18 17.4 18 19.2 19.6 21 19.6" />
    </svg>
  );
}
function Balloon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3.5c3 0 5 2.6 5 5.8S14.8 15 12 15 7 12.5 7 9.3 9 3.5 12 3.5Z" />
      <path d="M12 15v1.5M12 16.5l-1.4 2M12 16.5l1.4 2" />
    </svg>
  );
}
function Cross(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function Scissors(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="6.5" cy="6.5" r="2.3" />
      <circle cx="6.5" cy="17.5" r="2.3" />
      <path d="M8.4 7.9 20 18M8.4 16.1 20 6" />
    </svg>
  );
}
function Washer(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <circle cx="12" cy="13" r="4.2" />
      <path d="M9.5 13a2.5 2.5 0 0 1 5 0" />
      <circle cx="8" cy="6" r="0.5" />
      <circle cx="10.5" cy="6" r="0.5" />
    </svg>
  );
}
function Parking(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M9.5 16.5V7.5h3.4a2.6 2.6 0 0 1 0 5.2H9.5" />
    </svg>
  );
}

export const infraIconMap = {
  cart: Cart,
  coffee: Coffee,
  dumbbell: Dumbbell,
  waves: Waves,
  balloon: Balloon,
  cross: Cross,
  scissors: Scissors,
  washer: Washer,
  parking: Parking,
} as const;

export type InfraIconId = keyof typeof infraIconMap;
