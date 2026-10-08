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

import type {
  DeviceFilter,
} from "./DeviceFilters";

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
   * Busca e filtro agora ficam neste
   * componente porque precisam ser
   * compartilhados entre:
   *
   * - os cards de monitoramento;
   * - a área de dispositivos.
   */
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
   * Dispositivos utilizados nos
   * cards de resumo.
   *
   * Os valores continuam respeitando
   * o local atualmente selecionado.
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

  /*
   * Clique nos cards de monitoramento.
   *
   * Além de aplicar o filtro,
   * limpa uma eventual busca anterior
   * e leva o usuário até a área
   * de dispositivos.
   */
  function handleSummaryFilter(
    nextFilter: DeviceFilter,
  ) {
    setSearch("");

    setFilter(
      nextFilter,
    );

    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "dispositivos",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
    );
  }

  return (
    <>
      <DashboardSummary
        devices={
          selectedDevices
        }
        onFilterSelect={
          handleSummaryFilter
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
        search={
          search
        }
        filter={
          filter
        }
        onSearchChange={
          setSearch
        }
        onFilterChange={
          setFilter
        }
      />
    </>
  );
}