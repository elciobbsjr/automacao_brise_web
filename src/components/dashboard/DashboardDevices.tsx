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
  DeviceFilters,
  type DeviceFilter,
} from "./DeviceFilters";

import {
  DashboardGroupFilter,
} from "./DashboardGroupFilter";

import {
  ALL_GROUPS_KEY,
  UNGROUPED_KEY,
  filterDevicesByHierarchy,
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
}

export function DashboardDevices({
  devices,
  groupSelection,
  onGroupSelectionChange,
}: DashboardDevicesProps) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<DeviceFilter>(
      "all",
    );

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
    let nextSelection: DeviceGroupSelection;

    /*
     * Quando alteramos um nível,
     * todos os níveis abaixo dele
     * são resetados.
     *
     * Exemplo:
     *
     * Sede
     * → SEMEQ
     * → Manutenção
     *
     * Se trocar Sede por Fórum,
     * SEMEQ e Manutenção deixam
     * de fazer sentido.
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
     * Mantemos o comportamento
     * que você já tinha:
     *
     * ao trocar de local/setor,
     * limpamos busca e filtro de
     * ligado/desligado.
     */
    setFilter("all");
    setSearch("");
  }

  return (
    <section>
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Locais
            </h2>

            <p className="mt-1 text-sm text-slate-500">
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

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Dispositivos
        </h2>

        <span className="text-sm text-slate-500">
          {
            filteredDevices.length
          }{" "}
          exibido(s)
        </span>
      </div>

      <DeviceFilters
        search={search}
        filter={filter}
        total={
          devicesByGroup.length
        }
        onCount={onCount}
        offCount={offCount}
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

      {filteredDevices.length >
      0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map(
            (device) => (
              <DeviceCard
                key={
                  device.deviceId
                }
                device={device}
              />
            ),
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-700">
            Nenhum dispositivo encontrado.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Altere a busca,
            selecione outro
            filtro ou escolha
            outro local.
          </p>
        </div>
      )}
    </section>
  );
}