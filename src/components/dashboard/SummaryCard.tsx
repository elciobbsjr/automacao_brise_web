import type {
  ReactNode,
} from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;

  status:
    | "neutral"
    | "on"
    | "off"
    | "offline";
}

export function SummaryCard({
  title,
  value,
  description,
  status,
}: SummaryCardProps) {
  const statusStyles = {
    neutral: {
      card:
        "border-blue-100/90 bg-gradient-to-br from-white via-white to-blue-50/80",
      accent:
        "bg-blue-600",
      iconContainer:
        "border-blue-100 bg-blue-50 text-blue-700",
      title:
        "text-blue-700",
      indicator:
        "bg-blue-500",
      indicatorRing:
        "bg-blue-100",
      label:
        "Monitorados",
      labelStyle:
        "bg-blue-50 text-blue-700 border-blue-100",
      icon: (
        <EquipmentIcon />
      ),
    },

    on: {
      card:
        "border-emerald-100/90 bg-gradient-to-br from-white via-white to-emerald-50/80",
      accent:
        "bg-emerald-500",
      iconContainer:
        "border-emerald-100 bg-emerald-50 text-emerald-700",
      title:
        "text-emerald-700",
      indicator:
        "bg-emerald-500",
      indicatorRing:
        "bg-emerald-100",
      label:
        "Operando",
      labelStyle:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: (
        <PowerIcon />
      ),
    },

    off: {
      card:
        "border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-100/80",
      accent:
        "bg-slate-500",
      iconContainer:
        "border-slate-200 bg-slate-100 text-slate-600",
      title:
        "text-slate-600",
      indicator:
        "bg-slate-400",
      indicatorRing:
        "bg-slate-200",
      label:
        "Disponíveis",
      labelStyle:
        "bg-slate-100 text-slate-600 border-slate-200",
      icon: (
        <PowerOffIcon />
      ),
    },

    offline: {
      card:
        "border-amber-100/90 bg-gradient-to-br from-white via-white to-amber-50/90",
      accent:
        "bg-amber-500",
      iconContainer:
        "border-amber-100 bg-amber-50 text-amber-700",
      title:
        "text-amber-700",
      indicator:
        "bg-amber-500",
      indicatorRing:
        "bg-amber-100",
      label:
        "Atenção",
      labelStyle:
        "bg-amber-50 text-amber-700 border-amber-100",
      icon: (
        <OfflineIcon />
      ),
    },
  };

  const styles =
    statusStyles[status];

  return (
    <article
      className={`group relative min-h-[190px] overflow-hidden rounded-[24px] border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:p-6 ${styles.card}`}
    >
      {/* ==========================================
          DETALHES DECORATIVOS
          ========================================== */}

      <div
        className={`absolute inset-x-0 top-0 h-[3px] ${styles.accent}`}
      />

      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-[0.08] blur-2xl ${styles.accent}`}
      />

      {/* ==========================================
          CABEÇALHO
          ========================================== */}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.13em] ${styles.title}`}
          >
            {title}
          </p>

          <p className="mt-3 text-[42px] font-bold leading-none tracking-[-0.045em] text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition duration-300 group-hover:scale-105 ${styles.iconContainer}`}
        >
          {styles.icon}
        </div>
      </div>

      {/* ==========================================
          RODAPÉ DO CARD
          ========================================== */}

      <div className="relative mt-7 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">
            {description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${styles.indicatorRing}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${styles.indicator}`}
              />
            </span>

            <span className="text-xs text-slate-400">
              Atualização automática
            </span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${styles.labelStyle}`}
        >
          {styles.label}
        </span>
      </div>
    </article>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function SummaryIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <SummaryIcon>
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2.5"
      />

      <path d="M7 8h10" />

      <path d="M8 14h.01" />

      <path d="M12 14h.01" />

      <path d="M16 14h.01" />

      <path d="M8 21h8" />

      <path d="M10 18v3" />

      <path d="M14 18v3" />
    </SummaryIcon>
  );
}

function PowerIcon() {
  return (
    <SummaryIcon>
      <path d="M12 2v10" />

      <path d="M6.4 5.6A8 8 0 1 0 17.6 5.6" />
    </SummaryIcon>
  );
}

function PowerOffIcon() {
  return (
    <SummaryIcon>
      <path d="M12 2v10" />

      <path d="M6.4 5.6A8 8 0 1 0 17.6 5.6" />

      <path d="M4 4 20 20" />
    </SummaryIcon>
  );
}

function OfflineIcon() {
  return (
    <SummaryIcon>
      <path d="M5 12.55a11 11 0 0 1 14.08-.67" />

      <path d="M1.42 9a16 16 0 0 1 21.16-.72" />

      <path d="M8.53 16.11a6 6 0 0 1 6.95-.11" />

      <path d="M12 20h.01" />

      <path d="M3 3 21 21" />
    </SummaryIcon>
  );
}