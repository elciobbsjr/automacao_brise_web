"use client";

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
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />

            <path d="m21 21-4.35-4.35" />
          </svg>

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
            placeholder="Buscar dispositivo..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={
              filter === "all"
            }
            onClick={() =>
              onFilterChange(
                "all",
              )
            }
          >
            Todos
            <CountBadge
              value={total}
              active={
                filter === "all"
              }
            />
          </FilterButton>

          <FilterButton
            active={
              filter === "on"
            }
            onClick={() =>
              onFilterChange(
                "on",
              )
            }
          >
            <StatusDot type="on" />

            Ligados

            <CountBadge
              value={onCount}
              active={
                filter === "on"
              }
            />
          </FilterButton>

          <FilterButton
            active={
              filter === "off"
            }
            onClick={() =>
              onFilterChange(
                "off",
              )
            }
          >
            <StatusDot type="off" />

            Desligados

            <CountBadge
              value={offCount}
              active={
                filter === "off"
              }
            />
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "offline"
            }
            onClick={() =>
              onFilterChange(
                "offline",
              )
            }
          >
            <StatusDot
              type="offline"
            />

            Sem resposta

            <CountBadge
              value={
                offlineCount
              }
              active={
                filter ===
                "offline"
              }
            />
          </FilterButton>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children:
    React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function CountBadge({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  return (
    <span
      className={`flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        active
          ? "bg-white/15 text-white"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}

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
    <span
      className={`h-2 w-2 rounded-full ${className}`}
    />
  );
}