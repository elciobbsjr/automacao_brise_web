"use client";

import { useMemo, useState } from "react";

import type { DashboardDevice } from "@/types/dashboard";

import { DeviceCard } from "@/components/device/DeviceCard";

import { GroupDeviceControlModal } from "@/components/device/GroupDeviceControlModal";

import {
  DeviceFilters,
  type DeviceFilter,
} from "./DeviceFilters";

import { DashboardGroupFilter } from "./DashboardGroupFilter";

import { StatusGroupNavigator } from "./StatusGroupNavigator";

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
  canControlDevices: boolean;
  groupSelection: DeviceGroupSelection;

  onGroupSelectionChange: (
    selection: DeviceGroupSelection,
  ) => void;

  search?: string;
  filter?: DeviceFilter;

  onSearchChange?: (
    value: string,
  ) => void;

  onFilterChange?: (
    filter: DeviceFilter,
  ) => void;

  statusNavigationActive?: boolean;

  onStatusNavigationComplete?: (
    selection: DeviceGroupSelection,
  ) => void;

  onStatusNavigationCancel?: () => void;
}

export function DashboardDevices({
  devices,
  canControlDevices,
  groupSelection,
  onGroupSelectionChange,
  search: controlledSearch,
  filter: controlledFilter,
  onSearchChange,
  onFilterChange,
  statusNavigationActive = false,
  onStatusNavigationComplete,
  onStatusNavigationCancel,
}: DashboardDevicesProps) {
  const [
    internalSearch,
    setInternalSearch,
  ] = useState("");

  const [
    internalFilter,
    setInternalFilter,
  ] = useState<DeviceFilter>(
    "all",
  );

  const [
    groupControlOpen,
    setGroupControlOpen,
  ] = useState(false);

  const search =
    controlledSearch ??
    internalSearch;

  const filter =
    controlledFilter ??
    internalFilter;

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

  const level1Groups =
    useMemo(
      () =>
        getAvailableGroups(
          devices,
        ),
      [devices],
    );

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
        value !==
        ALL_GROUPS_KEY,
    )
    .map(
      (value) =>
        formatDeviceGroupName(
          value,
        ),
    );

  const hasSpecificGroup =
    groupPath.length > 0;

  const groupName =
    groupPath.at(-1) ??
    "Grupo selecionado";

  const onlineGroupDevices =
    devicesByGroup.filter(
      (device) =>
        device.online,
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

          if (!matchesSearch) {
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

    onStatusNavigationCancel?.();

    setFilter("all");
    setSearch("");
  }

  return (
    <section className="space-y-8">
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

      <div
        id="dispositivos"
        className="scroll-mt-6"
      >
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
            {canControlDevices &&
              hasSpecificGroup &&
              devicesByGroup.length >
                0 && (
                <section className="relative mb-6 overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-[0_12px_36px_rgba(15,23,42,0.065)] backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-blue-50/65" />

                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/25 blur-3xl" />

                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
                          <GroupControlIcon />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                              Controle coletivo
                            </span>

                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/75 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                              Grupo selecionado
                            </span>
                          </div>

                          <h3 className="mt-2 truncate text-2xl font-bold tracking-[-0.025em] text-slate-950">
                            {groupName}
                          </h3>

                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            Aplique comandos simultaneamente aos equipamentos disponíveis deste grupo.
                          </p>

                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            {groupPath.map(
                              (
                                item,
                                index,
                              ) => (
                                <div
                                  key={`${item}-${index}`}
                                  className="flex items-center gap-1.5"
                                >
                                  {index >
                                    0 && (
                                    <span className="text-xs text-slate-300">
                                      ›
                                    </span>
                                  )}

                                  <span
                                    className={
                                      index ===
                                      groupPath.length -
                                        1
                                        ? "inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                                        : "inline-flex items-center rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                                    }
                                  >
                                    {item}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          {onCount}{" "}
                          {onCount === 1
                            ? "ligado"
                            : "ligados"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                          {offCount}{" "}
                          {offCount === 1
                            ? "desligado"
                            : "desligados"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                          {offlineCount}{" "}
                          offline
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                          {
                            onlineGroupDevices.length
                          }{" "}
                          disponíveis para
                          controle
                        </span>
                      </div>
                    </div>

                    <div className="w-full shrink-0 lg:w-[270px]">
                      <div className="rounded-[20px] border border-slate-200/70 bg-white/65 p-4 backdrop-blur-sm">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="flex h-[82px] w-[82px] items-center justify-center rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                          <CollectiveRemoteIcon />
                        </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            {
                              onlineGroupDevices.length
                            }{" "}
                            {onlineGroupDevices.length ===
                            1
                              ? "equipamento disponível"
                              : "equipamentos disponíveis"}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Grupo selecionado
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setGroupControlOpen(
                              true,
                            )
                          }
                          disabled={
                            onlineGroupDevices.length ===
                            0
                          }
                          className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <GroupControlIcon />

                          Abrir controle
                        </button>

                        <p className="mt-2.5 text-center text-[9px] leading-4 text-slate-400">
                          Aplicado aos equipamentos
                          online do grupo
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

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
                        setSearch("");
                        setFilter("all");
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
                      canControl={
                        canControlDevices
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

      {canControlDevices && (
      <GroupDeviceControlModal
        devices={
          devicesByGroup
        }
        groupName={
          groupName
        }
        groupPath={
          groupPath
        }
        open={
          groupControlOpen
        }
        onClose={() =>
          setGroupControlOpen(
            false,
          )
        }
      />
    )}
    </section>
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

      <circle
        cx="16"
        cy="7"
        r="2"
      />

      <circle
        cx="8"
        cy="17"
        r="2"
      />
    </svg>
  );
}

function CollectiveRemoteIcon() {
  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      className="h-[58px] w-[42px]"
      aria-hidden="true"
    >
      {/* Corpo do controle */}
      <rect
        x="12"
        y="4"
        width="56"
        height="112"
        rx="16"
        fill="white"
        stroke="#355B68"
        strokeWidth="4"
      />

      {/* Tela */}
      <rect
        x="22"
        y="18"
        width="36"
        height="27"
        rx="4"
        fill="#B9D78D"
        stroke="#355B68"
        strokeWidth="3.5"
      />

      {/* Temperatura */}
      <text
        x="27"
        y="37"
        fill="#355B68"
        fontSize="15"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
      >
        24°
      </text>

      {/* Indicador pequeno da tela */}
      <path
        d="M48 37h6"
        stroke="#355B68"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Botão principal */}
      <rect
        x="31"
        y="52"
        width="18"
        height="10"
        rx="5"
        fill="#38BDF8"
        stroke="#355B68"
        strokeWidth="3"
      />

      {/* Botão esquerdo */}
      <rect
        x="21"
        y="69"
        width="17"
        height="11"
        rx="5.5"
        fill="#E7F7FA"
        stroke="#355B68"
        strokeWidth="3"
      />

      {/* Floco de neve */}
      <path
        d="M29.5 71.5v6"
        stroke="#269BB4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="m27 73 5 3"
        stroke="#269BB4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="m32 73-5 3"
        stroke="#269BB4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Botão direito */}
      <rect
        x="42"
        y="69"
        width="17"
        height="11"
        rx="5.5"
        fill="#F0F5F7"
        stroke="#355B68"
        strokeWidth="3"
      />

      {/* Ventilador */}
      <circle
        cx="50.5"
        cy="74.5"
        r="2"
        stroke="#355B68"
        strokeWidth="1.4"
      />
      <path
        d="M50.5 72c1-2 3-2 3.5-.5.4 1.2-.7 2.4-2.2 2.8"
        stroke="#355B68"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M48.5 75.5c-2 .2-3 1.8-2 3 .8 1 2.4.5 3.3-.7"
        stroke="#355B68"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M52 76c1 1.7.5 3.2-.9 3.4-1.3.2-2-1.2-1.8-2.5"
        stroke="#355B68"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Botões inferiores */}
      <rect
        x="21"
        y="88"
        width="17"
        height="10"
        rx="5"
        fill="#F8FAFC"
        stroke="#355B68"
        strokeWidth="3"
      />

      <rect
        x="42"
        y="88"
        width="17"
        height="10"
        rx="5"
        fill="#F8FAFC"
        stroke="#355B68"
        strokeWidth="3"
      />
    </svg>
  );
}

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