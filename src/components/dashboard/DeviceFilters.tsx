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
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: DeviceFilter) => void;
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
    <div className="mb-6 space-y-4">
      <input
        type="text"
        value={search}
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
        placeholder="Buscar por nome ou número..."
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
      />

      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={filter === "all"}
          onClick={() => onFilterChange("all")}
        >
          Todos ({total})
        </FilterButton>

        <FilterButton
          active={filter === "on"}
          onClick={() => onFilterChange("on")}
        >
          Ligados ({onCount})
        </FilterButton>

        <FilterButton
          active={filter === "off"}
          onClick={() => onFilterChange("off")}
        >
          Desligados ({offCount})
        </FilterButton>

        <FilterButton
          active={filter === "offline"}
          onClick={() => onFilterChange("offline")}
        >
          Sem resposta ({offlineCount})
        </FilterButton>
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
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}