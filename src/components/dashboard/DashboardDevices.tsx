"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  DeviceCard,
} from "@/components/device/DeviceCard";

import {
  GroupDeviceControlModal,
} from "@/components/device/GroupDeviceControlModal";

import {
  DeviceFilters,
  type DeviceFilter,
} from "./DeviceFilters";

import {
  DashboardGroupFilter,
} from "./DashboardGroupFilter";

import {
  StatusGroupNavigator,
} from "./StatusGroupNavigator";

import {
  ALL_GROUPS_KEY,
  UNGROUPED_KEY,
  filterDevicesByHierarchy,
  formatDeviceGroupName,
  getAvailableGroups,
  getAvailableGroupsAtLevel,
  type DeviceGroupSelection,
  type GroupLevel,
} from "@/utils/device-groups";

interface DashboardDevicesProps {
  devices: DashboardDevice[];

  groupSelection:
    DeviceGroupSelection;

  onGroupSelectionChange: (
    selection: DeviceGroupSelection,
  ) => void;

  /*
   * Estes campos permitem que
   * DashboardContent controle os
   * filtros através dos cards
   * de monitoramento.
   *
   * São opcionais para preservar
   * o funcionamento anterior
   * deste componente.
   */
  search?: string;

  filter?: DeviceFilter;

  onSearchChange?: (
    value: string,
  ) => void;

  onFilterChange?: (
    filter: DeviceFilter,
  ) => void;

  /*
   * NOVA NAVEGAÇÃO POR STATUS
   *
   * Quando ativa, em vez de
   * exibir imediatamente todos
   * os equipamentos, mostramos
   * primeiro os grupos da
   * hierarquia.
   */
  statusNavigationActive?: boolean;

  /*
   * Chamado quando chegamos
   * ao último grupo disponível
   * e podemos finalmente mostrar
   * os equipamentos.
   */
  onStatusNavigationComplete?: (
    selection:
      DeviceGroupSelection,
  ) => void;

  /*
   * Permite cancelar a navegação
   * especial caso o usuário use
   * novamente a navegação normal
   * por locais.
   */
  onStatusNavigationCancel?: () => void;
}

export function DashboardDevices({
  devices,
  groupSelection,
  onGroupSelectionChange,
  search:
    controlledSearch,
  filter:
    controlledFilter,
  onSearchChange,
  onFilterChange,
  statusNavigationActive = false,
  onStatusNavigationComplete,
  onStatusNavigationCancel,
}: DashboardDevicesProps) {
  /*
   * Mantemos os estados internos
   * existentes como fallback.
   *
   * Dessa forma, o componente
   * continua funcionando mesmo
   * sem receber os filtros do pai.
   */
  const [
    internalSearch,
    setInternalSearch,
  ] = useState("");

  const [
    internalFilter,
    setInternalFilter,
  ] =
    useState<DeviceFilter>(
      "all",
    );

  const [
    groupControlOpen,
    setGroupControlOpen,
  ] = useState(false);

  /*
   * Quando DashboardContent fornecer
   * os valores, utilizamos os valores
   * compartilhados.
   *
   * Caso contrário, utilizamos
   * os estados internos anteriores.
   */
  const search =
    controlledSearch ??
    internalSearch;

  const filter =
    controlledFilter ??
    internalFilter;

  /*
   * Mantemos os mesmos nomes
   * utilizados no restante do arquivo.
   *
   * Assim praticamente nenhuma
   * lógica existente precisa
   * ser alterada.
   */
  function setSearch(
    value: string,
  ) {
    if (onSearchChange) {
      onSearchChange(value);

      return;
    }

    setInternalSearch(value);
  }

  function setFilter(
    value: DeviceFilter,
  ) {
    if (onFilterChange) {
      onFilterChange(value);

      return;
    }

    setInternalFilter(value);
  }

  /*
   * NÍVEL 1
   *
   * Todos
   * Fórum
   * Sede
   * Sem grupo
   */
  const level1Groups =
    useMemo(
      () =>
        getAvailableGroups(
          devices,
        ),
      [devices],
    );

  /*
   * NÍVEL 2
   *
   * Só calculamos quando um
   * prédio/local específico estiver
   * selecionado.
   */
  const level2Groups =
    useMemo(() => {
      if (
        groupSelection.level1 ===
          ALL_GROUPS_KEY ||
        groupSelection.level1 ===
          UNGROUPED_KEY
      ) {
        return [];
      }

      return getAvailableGroupsAtLevel(
        devices,
        2,
        groupSelection,
      );
    }, [
      devices,
      groupSelection,
    ]);

  /*
   * NÍVEL 3
   *
   * Só aparece depois que um setor
   * específico foi selecionado.
   */
  const level3Groups =
    useMemo(() => {
      if (
        groupSelection.level1 ===
          ALL_GROUPS_KEY ||
        groupSelection.level1 ===
          UNGROUPED_KEY ||
        groupSelection.level2 ===
          ALL_GROUPS_KEY
      ) {
        return [];
      }

      return getAvailableGroupsAtLevel(
        devices,
        3,
        groupSelection,
      );
    }, [
      devices,
      groupSelection,
    ]);

  /*
   * NÍVEL 4
   *
   * Só aparece depois que uma
   * subdivisão específica foi
   * selecionada.
   */
  const level4Groups =
    useMemo(() => {
      if (
        groupSelection.level1 ===
          ALL_GROUPS_KEY ||
        groupSelection.level1 ===
          UNGROUPED_KEY ||
        groupSelection.level2 ===
          ALL_GROUPS_KEY ||
        groupSelection.level3 ===
          ALL_GROUPS_KEY
      ) {
        return [];
      }

      return getAvailableGroupsAtLevel(
        devices,
        4,
        groupSelection,
      );
    }, [
      devices,
      groupSelection,
    ]);

  /*
   * Aplica toda a hierarquia.
   */
  const devicesByGroup =
    useMemo(
      () =>
        filterDevicesByHierarchy(
          devices,
          groupSelection,
        ),
      [
        devices,
        groupSelection,
      ],
    );

  const onCount =
    devicesByGroup.filter(
      (device) =>
        device.online &&
        device.variables
          ?.state === true,
    ).length;

  const offCount =
    devicesByGroup.filter(
      (device) =>
        device.online &&
        device.variables
          ?.state !== true,
    ).length;

  const offlineCount =
    devicesByGroup.filter(
      (device) =>
        !device.online,
    ).length;

  const groupPath = [
    groupSelection.level1,
    groupSelection.level2,
    groupSelection.level3,
    groupSelection.level4,
  ]
    .filter(
      (value) =>
        value !== ALL_GROUPS_KEY,
    )
    .map((value) =>
      formatDeviceGroupName(value),
    );

  const hasSpecificGroup =
    groupPath.length > 0;

  const groupName =
    groupPath.at(-1) ??
    "Grupo selecionado";

  const onlineGroupDevices =
    devicesByGroup.filter(
      (device) => device.online,
    );

  const filteredDevices =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return devicesByGroup.filter(
        (device) => {
          const name =
            device.config
              ?.name
              ?.toLowerCase() ??
            "";

          const deviceId =
            String(
              device.deviceId,
            );

          const matchesSearch =
            name.includes(
              normalizedSearch,
            ) ||
            deviceId.includes(
              normalizedSearch,
            );

          if (
            !matchesSearch
          ) {
            return false;
          }

          if (
            filter === "on"
          ) {
            return (
              device.online &&
              device.variables
                ?.state === true
            );
          }

          if (
            filter === "off"
          ) {
            return (
              device.online &&
              device.variables
                ?.state !== true
            );
          }

          if (
            filter ===
            "offline"
          ) {
            return !device.online;
          }

          return true;
        },
      );
    }, [
      devicesByGroup,
      search,
      filter,
    ]);

  function handleGroupChange(
    level: GroupLevel,
    value: string,
  ) {
    let nextSelection:
      DeviceGroupSelection;

    /*
     * Quando alteramos um nível,
     * todos os níveis abaixo dele
     * são resetados.
     */
    switch (level) {
      case 1:
        nextSelection = {
          level1: value,

          level2:
            ALL_GROUPS_KEY,

          level3:
            ALL_GROUPS_KEY,

          level4:
            ALL_GROUPS_KEY,
        };

        break;

      case 2:
        nextSelection = {
          ...groupSelection,

          level2: value,

          level3:
            ALL_GROUPS_KEY,

          level4:
            ALL_GROUPS_KEY,
        };

        break;

      case 3:
        nextSelection = {
          ...groupSelection,

          level3: value,

          level4:
            ALL_GROUPS_KEY,
        };

        break;

      case 4:
        nextSelection = {
          ...groupSelection,

          level4: value,
        };

        break;
    }

    onGroupSelectionChange(
      nextSelection,
    );

    /*
     * Caso o usuário utilize
     * manualmente a navegação
     * normal por locais, encerramos
     * a navegação especial iniciada
     * pelos cards de monitoramento.
     */
    onStatusNavigationCancel?.();

    /*
     * Mantemos o comportamento
     * atual:
     *
     * ao trocar de local/setor,
     * limpamos busca e filtros.
     */
    setFilter("all");

    setSearch("");
  }

  return (
    <section className="space-y-8">
      {/* ==========================================
          NAVEGAÇÃO POR LOCAL
          ========================================== */}

      <div>
        <div className="mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />

              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                Locais
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Selecione o prédio,
              setor ou área que
              deseja visualizar.
            </p>
          </div>
        </div>

        <DashboardGroupFilter
          selection={
            groupSelection
          }
          level1Groups={
            level1Groups
          }
          level2Groups={
            level2Groups
          }
          level3Groups={
            level3Groups
          }
          level4Groups={
            level4Groups
          }
          onChange={
            handleGroupChange
          }
        />
      </div>

      {/* ==========================================
          DISPOSITIVOS
          ========================================== */}

      <div
        id="dispositivos"
        className="scroll-mt-6"
      >
        {/* CABEÇALHO */}

        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-600" />

            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">
              Dispositivos
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {statusNavigationActive
              ? "Selecione um grupo para localizar os equipamentos desejados."
              : "Consulte o estado, temperatura e operação dos equipamentos encontrados."}
          </p>
        </div>

        {/* ======================================
            NAVEGAÇÃO POR STATUS
            ====================================== */}

        {statusNavigationActive ? (
          <StatusGroupNavigator
            devices={devices}
            filter={filter}
            selection={
              groupSelection
            }
            onSelectionChange={
              onGroupSelectionChange
            }
            onLeafReached={(
              selection,
            ) => {
              onStatusNavigationComplete?.(
                selection,
              );
            }}
          />
        ) : (
          <>
            {hasSpecificGroup &&
              devicesByGroup.length > 0 && (
                <section className="relative mb-6 overflow-hidden rounded-[24px] border border-blue-100/80 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />
                  <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-100/45 blur-3xl" />

                  <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <GroupControlIcon />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                          Controle coletivo
                        </p>

                        <h3 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-950">
                          {groupName}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {groupPath.join(" › ")}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <GroupMetric
                            label={`${onCount} ligados`}
                            tone="green"
                          />
                          <GroupMetric
                            label={`${offCount} desligados`}
                            tone="slate"
                          />
                          <GroupMetric
                            label={`${offlineCount} offline`}
                            tone="amber"
                          />
                          <GroupMetric
                            label={`${onlineGroupDevices.length} disponíveis para controle`}
                            tone="blue"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setGroupControlOpen(true)
                      }
                      disabled={
                        onlineGroupDevices.length === 0
                      }
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <GroupControlIcon />
                      Controle do grupo
                    </button>
                  </div>
                </section>
              )}

            {/* ======================================
                FILTROS
                ====================================== */}

            <div className="relative mb-6 overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/90 to-slate-50/70" />

              <div className="relative p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <FilterIcon />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Busca e filtros
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Refine os
                        equipamentos
                        exibidos abaixo.
                      </p>
                    </div>
                  </div>

                  {(search !== "" ||
                    filter !==
                      "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(
                          "",
                        );

                        setFilter(
                          "all",
                        );
                      }}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>

                <DeviceFilters
                  search={search}
                  filter={filter}
                  total={
                    devicesByGroup.length
                  }
                  onCount={
                    onCount
                  }
                  offCount={
                    offCount
                  }
                  offlineCount={
                    offlineCount
                  }
                  onSearchChange={
                    setSearch
                  }
                  onFilterChange={
                    setFilter
                  }
                />
              </div>
            </div>

            {/* ======================================
                GRADE DE DISPOSITIVOS
                ====================================== */}

            {filteredDevices.length >
            0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDevices.map(
                  (device) => (
                    <DeviceCard
                      key={
                        device.deviceId
                      }
                      device={
                        device
                      }
                      allDevices={
                        devices
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyDevicesState />
            )}
          </>
        )}
      </div>

      <GroupDeviceControlModal
        devices={devicesByGroup}
        groupName={groupName}
        groupPath={groupPath}
        open={groupControlOpen}
        onClose={() =>
          setGroupControlOpen(false)
        }
      />
    </section>
  );
}

function GroupMetric({
  label,
  tone,
}: {
  label: string;
  tone:
    | "green"
    | "slate"
    | "amber"
    | "blue";
}) {
  const styles = {
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    slate:
      "border-slate-200 bg-slate-100 text-slate-600",
    amber:
      "border-amber-100 bg-amber-50 text-amber-700",
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

function GroupControlIcon() {
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
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

/* ==========================================
   ESTADO VAZIO
   ========================================== */

function EmptyDevicesState() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-10 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white/80 to-blue-50/50" />

      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm">
          <SearchEmptyIcon />
        </div>

        <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
          Nenhum dispositivo encontrado
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Altere a busca,
          selecione outro filtro
          ou escolha outro local
          para visualizar os
          equipamentos.
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-blue-600"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function FilterIcon() {
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
      <path d="M4 6h16" />

      <path d="M7 12h10" />

      <path d="M10 18h4" />
    </svg>
  );
}

function SearchEmptyIcon() {
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
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />

      <path d="M8.5 11h5" />
    </svg>
  );
}