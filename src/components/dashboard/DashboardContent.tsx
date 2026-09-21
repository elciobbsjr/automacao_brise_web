"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  DashboardResponse,
} from "@/types/dashboard";

import {
  createDefaultGroupSelection,
  filterDevicesByHierarchy,
  type DeviceGroupSelection,
} from "@/utils/device-groups";

import {
  DashboardSummary,
} from "./DashboardSummary";

import {
  DashboardDevices,
} from "./DashboardDevices";

interface DashboardContentProps {
  dashboard: DashboardResponse;
}

export function DashboardContent({
  dashboard,
}: DashboardContentProps) {
  const [
    groupSelection,
    setGroupSelection,
  ] =
    useState<DeviceGroupSelection>(
      createDefaultGroupSelection,
    );

  /*
   * Estes são os dispositivos que
   * alimentam os cards de resumo.
   *
   * Portanto, ao selecionar:
   *
   * Sede
   * → SEMEQ
   * → Manutenção
   *
   * os números do topo também serão
   * recalculados somente para esse grupo.
   */
  const selectedDevices =
    useMemo(
      () =>
        filterDevicesByHierarchy(
          dashboard.devices,
          groupSelection,
        ),
      [
        dashboard.devices,
        groupSelection,
      ],
    );

  return (
    <>
      <DashboardSummary
        devices={
          selectedDevices
        }
      />

      <DashboardDevices
        devices={
          dashboard.devices
        }
        groupSelection={
          groupSelection
        }
        onGroupSelectionChange={
          setGroupSelection
        }
      />
    </>
  );
}