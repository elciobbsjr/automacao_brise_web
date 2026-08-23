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
  filterDevicesByGroup,
  getAvailableGroups,
} from "@/utils/device-groups";

interface DashboardDevicesProps {
  devices: DashboardDevice[];

  selectedGroup: string;

  onGroupChange: (
    group: string,
  ) => void;
}

export function DashboardDevices({
  devices,
  selectedGroup,
  onGroupChange,
}: DashboardDevicesProps) {
  const [search, setSearch] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<DeviceFilter>(
      "all",
    );

  const groups =
    useMemo(
      () =>
        getAvailableGroups(
          devices,
        ),
      [devices],
    );

  const devicesByGroup =
    useMemo(
      () =>
        filterDevicesByGroup(
          devices,
          selectedGroup,
        ),
      [
        devices,
        selectedGroup,
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
    group: string,
  ) {
    onGroupChange(group);

    // Ao mudar de prédio/local,
    // limpamos os filtros secundários.
    setFilter("all");
    setSearch("");
  }

  return (
    <section>
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Locais
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Selecione o prédio
              ou grupo que deseja
              visualizar.
            </p>
          </div>
        </div>

        <DashboardGroupFilter
          groups={groups}
          selectedGroup={
            selectedGroup
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