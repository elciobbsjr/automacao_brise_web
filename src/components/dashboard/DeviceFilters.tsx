"use client";

import type {
  ReactNode,
} from "react";

export type DeviceFilter =
  | "all"
  | "on"
  | "off"
  | "offline";

interface DeviceFiltersProps {
  search: string;

  filter: DeviceFilter;

  total: number;

  onCount: number;

  offCount: number;

  offlineCount: number;

  onSearchChange: (
    value: string,
  ) => void;

  onFilterChange: (
    filter: DeviceFilter,
  ) => void;
}

export function DeviceFilters({
  search,
  filter,
  total,
  onCount,
  offCount,
  offlineCount,
  onSearchChange,
  onFilterChange,
}: DeviceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
      {/* ==========================================
          BUSCA
          ========================================== */}

      <div className="min-w-0 flex-1">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Buscar equipamento
        </label>

        <div className="group relative">
          <div className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition group-focus-within:bg-blue-50 group-focus-within:text-blue-600">
            <SearchIcon />
          </div>

          <input
            type="text"
            value={search}
            onChange={(
              event,
            ) =>
              onSearchChange(
                event.target
                  .value,
              )
            }
            placeholder="Nome ou número do dispositivo"
            className="h-12 w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 pl-14 pr-12 text-sm font-medium text-slate-900 outline-none transition duration-200 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
          />

          {search !== "" && (
            <button
              type="button"
              onClick={() =>
                onSearchChange("")
              }
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          FILTROS DE ESTADO
          ========================================== */}

      <div className="shrink-0">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Estado do equipamento
        </p>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={
              filter === "all"
            }
            tone="blue"
            icon={
              <AllDevicesIcon />
            }
            onClick={() =>
              onFilterChange(
                "all",
              )
            }
          >
            <span>
              Todos
            </span>

            <CountBadge
              value={total}
              active={
                filter === "all"
              }
              tone="blue"
            />
          </FilterButton>

          <FilterButton
            active={
              filter === "on"
            }
            tone="green"
            icon={
              <StatusDot
                type="on"
              />
            }
            onClick={() =>
              onFilterChange(
                "on",
              )
            }
          >
            <span>
              Ligados
            </span>

            <CountBadge
              value={onCount}
              active={
                filter === "on"
              }
              tone="green"
            />
          </FilterButton>

          <FilterButton
            active={
              filter === "off"
            }
            tone="slate"
            icon={
              <StatusDot
                type="off"
              />
            }
            onClick={() =>
              onFilterChange(
                "off",
              )
            }
          >
            <span>
              Desligados
            </span>

            <CountBadge
              value={offCount}
              active={
                filter === "off"
              }
              tone="slate"
            />
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "offline"
            }
            tone="amber"
            icon={
              <StatusDot
                type="offline"
              />
            }
            onClick={() =>
              onFilterChange(
                "offline",
              )
            }
          >
            <span>
              Sem resposta
            </span>

            <CountBadge
              value={
                offlineCount
              }
              active={
                filter ===
                "offline"
              }
              tone="amber"
            />
          </FilterButton>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   BOTÃO DE FILTRO
   ========================================== */

type FilterTone =
  | "blue"
  | "green"
  | "slate"
  | "amber";

function FilterButton({
  active,
  tone,
  icon,
  children,
  onClick,
}: {
  active: boolean;

  tone: FilterTone;

  icon: ReactNode;

  children:
    ReactNode;

  onClick: () => void;
}) {
  const styles = {
    blue: {
      active:
        "border-blue-600 bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.20)]",

      inactive:
        "border-blue-100 bg-blue-50/55 text-blue-800 hover:border-blue-200 hover:bg-blue-50",
    },

    green: {
      active:
        "border-emerald-600 bg-emerald-600 text-white shadow-[0_6px_18px_rgba(5,150,105,0.18)]",

      inactive:
        "border-emerald-100 bg-emerald-50/55 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50",
    },

    slate: {
      active:
        "border-slate-700 bg-slate-700 text-white shadow-[0_6px_18px_rgba(51,65,85,0.16)]",

      inactive:
        "border-slate-200 bg-slate-100/70 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
    },

    amber: {
      active:
        "border-amber-500 bg-amber-500 text-white shadow-[0_6px_18px_rgba(245,158,11,0.18)]",

      inactive:
        "border-amber-100 bg-amber-50/70 text-amber-800 hover:border-amber-200 hover:bg-amber-50",
    },
  };

  const current =
    styles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition duration-200 ${
        active
          ? current.active
          : current.inactive
      }`}
    >
      <span className="flex shrink-0 items-center justify-center">
        {icon}
      </span>

      {children}
    </button>
  );
}

/* ==========================================
   CONTADOR
   ========================================== */

function CountBadge({
  value,
  active,
  tone,
}: {
  value: number;

  active: boolean;

  tone: FilterTone;
}) {
  const inactiveStyles = {
    blue:
      "bg-blue-100 text-blue-700",

    green:
      "bg-emerald-100 text-emerald-700",

    slate:
      "bg-white text-slate-600",

    amber:
      "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`flex min-w-6 items-center justify-center rounded-lg px-1.5 py-0.5 text-[11px] font-bold ${
        active
          ? "bg-white/20 text-white"
          : inactiveStyles[
              tone
            ]
      }`}
    >
      {value}
    </span>
  );
}

/* ==========================================
   INDICADORES
   ========================================== */

function StatusDot({
  type,
}: {
  type:
    | "on"
    | "off"
    | "offline";
}) {
  const className =
    type === "on"
      ? "bg-emerald-500"
      : type === "off"
        ? "bg-slate-400"
        : "bg-amber-500";

  return (
    <span className="relative flex h-4 w-4 items-center justify-center">
      <span
        className={`absolute h-3 w-3 rounded-full opacity-20 ${className}`}
      />

      <span
        className={`relative h-1.5 w-1.5 rounded-full ${className}`}
      />
    </span>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />

      <path d="m18 6-12 12" />
    </svg>
  );
}

function AllDevicesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
    </svg>
  );
}