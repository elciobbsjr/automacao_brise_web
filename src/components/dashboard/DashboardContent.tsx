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
   * Controla a nova navegação
   * hierárquica iniciada através
   * dos cards de monitoramento.
   *
   * false:
   * comportamento normal da tela.
   *
   * true:
   * exibe os grupos que possuem
   * equipamentos do status escolhido.
   */
  const [
    statusNavigationActive,
    setStatusNavigationActive,
  ] = useState(false);

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
   * Agora não exibimos imediatamente
   * todos os equipamentos daquele
   * status.
   *
   * Primeiro ativamos a navegação
   * hierárquica por grupos.
   */
  function handleSummaryFilter(
    nextFilter: DeviceFilter,
  ) {
    /*
     * Uma busca antiga poderia esconder
     * grupos ou equipamentos da nova
     * navegação.
     */
    setSearch("");

    /*
     * Mantemos o status escolhido:
     *
     * all
     * on
     * off
     * offline
     */
    setFilter(
      nextFilter,
    );

    /*
     * Ativa a navegação:
     *
     * Local
     * → Setor
     * → Subdivisão
     * → Área
     * → Equipamentos
     */
    setStatusNavigationActive(
      true,
    );

    /*
     * Leva o usuário até a área
     * em que a nova navegação
     * será exibida.
     */
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

  /*
   * Quando o usuário utiliza os
   * filtros normais da área de
   * dispositivos, saímos do modo
   * de navegação por status.
   *
   * Isso preserva o funcionamento
   * que já existia anteriormente.
   */
  function handleDeviceFilterChange(
    nextFilter: DeviceFilter,
  ) {
    setFilter(
      nextFilter,
    );

    setStatusNavigationActive(
      false,
    );
  }

  /*
   * Chamado quando o usuário percorreu
   * a hierarquia iniciada pelo card
   * de monitoramento e chegou ao grupo
   * que realmente contém os aparelhos.
   *
   * Mantemos:
   *
   * - o filtro de status;
   * - a seleção hierárquica.
   *
   * Apenas encerramos o navegador de
   * grupos para mostrar os equipamentos.
   */
  function handleStatusNavigationComplete(
    selection:
      DeviceGroupSelection,
  ) {
    setGroupSelection(
      selection,
    );

    setStatusNavigationActive(
      false,
    );

    /*
     * Mantemos o usuário na própria
     * área de dispositivos.
     */
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

  /*
   * Permite ao DashboardDevices
   * cancelar a navegação especial
   * quando necessário sem alterar
   * o status selecionado.
   */
  function handleStatusNavigationCancel() {
    setStatusNavigationActive(
      false,
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
          handleDeviceFilterChange
        }

        /*
         * NOVA NAVEGAÇÃO
         * POR STATUS / HIERARQUIA
         */
        statusNavigationActive={
          statusNavigationActive
        }
        onStatusNavigationComplete={
          handleStatusNavigationComplete
        }
        onStatusNavigationCancel={
          handleStatusNavigationCancel
        }
      />
    </>
  );
}