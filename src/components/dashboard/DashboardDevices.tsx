"use client";

import { useMemo, useState } from "react";

import type { DashboardDevice } from "@/types/dashboard";

import { DeviceCard } from "@/components/device/DeviceCard";

import {
  DeviceFilters,
  type DeviceFilter,
} from "./DeviceFilters";

interface DashboardDevicesProps {
  devices: DashboardDevice[];
}

export function DashboardDevices({
  devices,
}: DashboardDevicesProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<DeviceFilter>("all");

  const onCount = devices.filter(
    (device) =>
      device.online &&
      device.variables?.state === true,
  ).length;

  const offCount = devices.filter(
    (device) =>
      device.online &&
      device.variables?.state !== true,
  ).length;

  const offlineCount = devices.filter(
    (device) => !device.online,
  ).length;

  const filteredDevices = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return devices.filter((device) => {
      const name =
        device.config?.name?.toLowerCase() ?? "";

      const deviceId =
        String(device.deviceId);

      const matchesSearch =
        name.includes(normalizedSearch) ||
        deviceId.includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "on") {
        return (
          device.online &&
          device.variables?.state === true
        );
      }

      if (filter === "off") {
        return (
          device.online &&
          device.variables?.state !== true
        );
      }

      if (filter === "offline") {
        return !device.online;
      }

      return true;
    });
  }, [devices, search, filter]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Dispositivos
        </h2>

        <span className="text-sm text-gray-500">
          {filteredDevices.length} exibido(s)
        </span>
      </div>

      <DeviceFilters
        search={search}
        filter={filter}
        total={devices.length}
        onCount={onCount}
        offCount={offCount}
        offlineCount={offlineCount}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />

      {filteredDevices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.deviceId}
              device={device}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-gray-700">
            Nenhum dispositivo encontrado.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Altere a busca ou selecione outro filtro.
          </p>
        </div>
      )}
    </section>
  );
}