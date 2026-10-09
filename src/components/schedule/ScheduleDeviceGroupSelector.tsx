"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  ALL_GROUPS_KEY,
  filterDevicesByHierarchy,
  formatDeviceGroupName,
  getAvailableGroups,
  getAvailableGroupsAtLevel,
  type DeviceGroupSelection,
  type GroupLevel,
} from "@/utils/device-groups";

/* ==========================================
   PROPS
   ========================================== */

interface ScheduleDeviceGroupSelectorProps {
  devices: DashboardDevice[];

  selectedDeviceIds: number[];

  onSelectionChange: (
    deviceIds: number[],
  ) => void;
}

/* ==========================================
   COMPONENTE
   ========================================== */

export function ScheduleDeviceGroupSelector({
  devices,
  selectedDeviceIds,
  onSelectionChange,
}: ScheduleDeviceGroupSelectorProps) {
  const [
    selection,
    setSelection,
  ] =
    useState<DeviceGroupSelection>(
      createEmptySelection,
    );

  /*
   * Equipamentos atualmente visíveis
   * dentro da hierarquia selecionada.
   *
   * Na raiz:
   * → todos os equipamentos.
   *
   * Em Sede:
   * → somente equipamentos da Sede.
   *
   * Em Sede > Administrativo:
   * → somente equipamentos daquele setor.
   */
  const branchDevices =
    useMemo(
      () =>
        filterDevicesByHierarchy(
          devices,
          selection,
        ),
      [
        devices,
        selection,
      ],
    );

  const currentLevel =
    getCurrentLevel(
      selection,
    );

  const groups =
    useMemo(() => {
      if (
        currentLevel === null
      ) {
        return [];
      }

      if (
        currentLevel === 1
      ) {
        return getAvailableGroups(
          devices,
        );
      }

      return getAvailableGroupsAtLevel(
        devices,
        currentLevel,
        selection,
      );
    }, [
      devices,
      currentLevel,
      selection,
    ]);

  const groupItems =
    useMemo(
      () =>
        groups
          .map(
            (group) => {
              if (
                currentLevel === null
              ) {
                return null;
              }

              const nextSelection =
                createSelectionForLevel(
                  selection,
                  currentLevel,
                  group,
                );

              const groupDevices =
                filterDevicesByHierarchy(
                  devices,
                  nextSelection,
                );

              const deviceIds =
                groupDevices.map(
                  (device) =>
                    device.deviceId,
                );

              return {
                key: group,

                label:
                  formatDeviceGroupName(
                    group,
                  ),

                selection:
                  nextSelection,

                deviceIds,

                count:
                  deviceIds.length,
              };
            },
          )
          .filter(
            (
              item,
            ): item is GroupItem =>
              item !== null &&
              item.count > 0,
          ),
      [
        groups,
        currentLevel,
        selection,
        devices,
      ],
    );

  const branchDeviceIds =
    useMemo(
      () =>
        branchDevices.map(
          (device) =>
            device.deviceId,
        ),
      [branchDevices],
    );

  const branchSelected =
    branchDeviceIds.length > 0 &&
    branchDeviceIds.every(
      (id) =>
        selectedDeviceIds.includes(
          id,
        ),
    );

  const branchPartiallySelected =
    !branchSelected &&
    branchDeviceIds.some(
      (id) =>
        selectedDeviceIds.includes(
          id,
        ),
    );

  const selectedPath =
    getSelectedPath(
      selection,
    );

  const isRoot =
    selectedPath.length === 0;

  const levelInfo =
    currentLevel !== null
      ? getLevelInfo(
          currentLevel,
        )
      : null;

  /* ==========================================
     SELEÇÃO
     ========================================== */

  function toggleCurrentBranch() {
    toggleDeviceIds(
      branchDeviceIds,
    );
  }

  function toggleGroup(
    ids: number[],
  ) {
    toggleDeviceIds(
      ids,
    );
  }

  function toggleDevice(
    deviceId: number,
  ) {
    if (
      selectedDeviceIds.includes(
        deviceId,
      )
    ) {
      onSelectionChange(
        selectedDeviceIds.filter(
          (id) =>
            id !== deviceId,
        ),
      );

      return;
    }

    onSelectionChange([
      ...selectedDeviceIds,
      deviceId,
    ]);
  }

  function toggleDeviceIds(
    ids: number[],
  ) {
    if (
      ids.length === 0
    ) {
      return;
    }

    const allIdsSelected =
      ids.every(
        (id) =>
          selectedDeviceIds.includes(
            id,
          ),
      );

    if (allIdsSelected) {
      const idsToRemove =
        new Set(ids);

      onSelectionChange(
        selectedDeviceIds.filter(
          (id) =>
            !idsToRemove.has(
              id,
            ),
        ),
      );

      return;
    }

    onSelectionChange(
      Array.from(
        new Set([
          ...selectedDeviceIds,
          ...ids,
        ]),
      ),
    );
  }

  /* ==========================================
     NAVEGAÇÃO
     ========================================== */

  function openGroup(
    item: GroupItem,
  ) {
    setSelection(
      item.selection,
    );
  }

  function handleBack() {
    setSelection(
      goBackOneLevel(
        selection,
      ),
    );
  }

  function handleRoot() {
    setSelection(
      createEmptySelection(),
    );
  }

  return (
    <div className="space-y-4">
      {/* ======================================
          TODOS OS EQUIPAMENTOS
          ====================================== */}

      <button
        type="button"
        onClick={
          handleRoot
        }
        className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 ${
          isRoot
            ? "border-blue-300 bg-blue-50/70 shadow-sm"
            : "border-slate-200 bg-white/80 hover:border-blue-200 hover:bg-blue-50/40"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isRoot
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <EquipmentIcon />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">
            Todos os equipamentos
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            Visualizar os{" "}
            {devices.length}{" "}
            equipamentos disponíveis.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
            {devices.length}
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition group-hover:border-blue-200 group-hover:text-blue-700">
            <ChevronLargeIcon />
          </span>
        </div>
      </button>

      {/* ======================================
          SELEÇÃO POR HIERARQUIA
          ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/75">
        {/* CABEÇALHO */}

        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <HierarchyIcon />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Seleção por grupo
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Refine os equipamentos
                  por local, setor ou área.
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">
              {
                selectedDeviceIds.length
              }{" "}
              selecionado(s)
            </span>
          </div>

          {/* CAMINHO */}

          {selectedPath.length >
            0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={
                  handleRoot
                }
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-700"
              >
                Todos
              </button>

              {selectedPath.map(
                (
                  item,
                  index,
                ) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    <ChevronIcon />

                    <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      {item}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ==================================
            NÍVEL DA HIERARQUIA
            ================================== */}

        <div className="p-4 sm:p-5">
          {levelInfo && (
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {levelInfo.eyebrow}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {levelInfo.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {
                  levelInfo.description
                }
              </p>
            </div>
          )}

          {groupItems.length >
          0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {groupItems.map(
                (item) => {
                  const allGroupSelected =
                    item.deviceIds.every(
                      (id) =>
                        selectedDeviceIds.includes(
                          id,
                        ),
                    );

                  const partiallySelected =
                    !allGroupSelected &&
                    item.deviceIds.some(
                      (id) =>
                        selectedDeviceIds.includes(
                          id,
                        ),
                    );

                  return (
                    <GroupCard
                      key={
                        item.key
                      }
                      label={
                        item.label
                      }
                      count={
                        item.count
                      }
                      selected={
                        allGroupSelected
                      }
                      partial={
                        partiallySelected
                      }
                      onOpen={() =>
                        openGroup(
                          item,
                        )
                      }
                      onToggle={() =>
                        toggleGroup(
                          item.deviceIds,
                        )
                      }
                    />
                  );
                },
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center">
              <p className="text-xs font-medium text-slate-500">
                Não existem níveis
                inferiores nesta
                seleção.
              </p>
            </div>
          )}

          {selectedPath.length >
            0 && (
            <button
              type="button"
              onClick={
                handleBack
              }
              className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeftIcon />

              Voltar um nível
            </button>
          )}
        </div>
      </div>

      {/* ======================================
          LISTA DOS EQUIPAMENTOS
          ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/75">
        {/* CABEÇALHO */}

        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <EquipmentSmallIcon />

              <p className="text-sm font-bold text-slate-900">
                {isRoot
                  ? "Todos os equipamentos"
                  : "Equipamentos deste grupo"}
              </p>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {
                branchDevices.length
              }{" "}
              {branchDevices.length ===
              1
                ? "equipamento disponível"
                : "equipamentos disponíveis"}
            </p>
          </div>

          {branchDeviceIds.length >
            0 && (
            <button
              type="button"
              onClick={
                toggleCurrentBranch
              }
              className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                branchSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : branchPartiallySelected
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-blue-700 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              {branchSelected
                ? "Desmarcar todos"
                : branchPartiallySelected
                  ? "Selecionar todos"
                  : "Selecionar todos"}
            </button>
          )}
        </div>

        {/* EQUIPAMENTOS */}

        {branchDevices.length >
        0 ? (
          <div className="grid max-h-[300px] gap-2 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
            {branchDevices.map(
              (device) => {
                const selected =
                  selectedDeviceIds.includes(
                    device.deviceId,
                  );

                const deviceName =
                  device.config
                    ?.name ||
                  `Dispositivo ${device.deviceId}`;

                const model =
                  device.config
                    ?.MODEL ||
                  "Modelo indisponível";

                return (
                  <button
                    key={
                      device.deviceId
                    }
                    type="button"
                    onClick={() =>
                      toggleDevice(
                        device.deviceId,
                      )
                    }
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-blue-300 bg-blue-50/70 shadow-sm"
                        : "border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {selected ? (
                        <CheckIcon />
                      ) : (
                        <EquipmentSmallIcon />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {
                          deviceName
                        }
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {model}
                        {" · Nº "}
                        {
                          device.deviceId
                        }
                      </p>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        ) : (
          <div className="p-5 text-center">
            <p className="text-xs text-slate-500">
              Nenhum equipamento
              disponível nesta seleção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   CARD DO GRUPO
   ========================================== */

interface GroupItem {
  key: string;

  label: string;

  selection:
    DeviceGroupSelection;

  deviceIds: number[];

  count: number;
}

function GroupCard({
  label,
  count,
  selected,
  partial,
  onOpen,
  onToggle,
}: {
  label: string;

  count: number;

  selected: boolean;

  partial: boolean;

  onOpen: () => void;

  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border p-2 transition ${
        selected
          ? "border-blue-200 bg-blue-50/70"
          : partial
            ? "border-cyan-200 bg-cyan-50/40"
            : "border-slate-200 bg-white/80 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={
          onOpen
        }
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            selected
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <FolderIcon />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {count}{" "}
            {count === 1
              ? "equipamento"
              : "equipamentos"}
          </p>
        </div>

        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-white group-hover:text-blue-700">
          <ChevronLargeIcon />
        </span>
      </button>

      <button
        type="button"
        onClick={
          onToggle
        }
        aria-label={
          selected
            ? `Desmarcar ${label}`
            : `Selecionar ${label}`
        }
        title={
          selected
            ? "Desmarcar grupo"
            : "Selecionar grupo"
        }
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : partial
              ? "border-cyan-200 bg-cyan-50 text-cyan-700"
              : "border-slate-200 bg-white text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        {selected ? (
          <CheckSmallIcon />
        ) : partial ? (
          <PartialIcon />
        ) : (
          <PlusIcon />
        )}
      </button>
    </div>
  );
}

/* ==========================================
   HIERARQUIA
   ========================================== */

function createEmptySelection():
  DeviceGroupSelection {
  return {
    level1:
      ALL_GROUPS_KEY,

    level2:
      ALL_GROUPS_KEY,

    level3:
      ALL_GROUPS_KEY,

    level4:
      ALL_GROUPS_KEY,
  };
}

function getCurrentLevel(
  selection:
    DeviceGroupSelection,
): GroupLevel | null {
  if (
    selection.level1 ===
    ALL_GROUPS_KEY
  ) {
    return 1;
  }

  if (
    selection.level2 ===
    ALL_GROUPS_KEY
  ) {
    return 2;
  }

  if (
    selection.level3 ===
    ALL_GROUPS_KEY
  ) {
    return 3;
  }

  if (
    selection.level4 ===
    ALL_GROUPS_KEY
  ) {
    return 4;
  }

  return null;
}

function createSelectionForLevel(
  selection:
    DeviceGroupSelection,
  level: GroupLevel,
  value: string,
): DeviceGroupSelection {
  switch (level) {
    case 1:
      return {
        level1: value,

        level2:
          ALL_GROUPS_KEY,

        level3:
          ALL_GROUPS_KEY,

        level4:
          ALL_GROUPS_KEY,
      };

    case 2:
      return {
        ...selection,

        level2: value,

        level3:
          ALL_GROUPS_KEY,

        level4:
          ALL_GROUPS_KEY,
      };

    case 3:
      return {
        ...selection,

        level3: value,

        level4:
          ALL_GROUPS_KEY,
      };

    case 4:
      return {
        ...selection,

        level4: value,
      };
  }
}

function goBackOneLevel(
  selection:
    DeviceGroupSelection,
): DeviceGroupSelection {
  if (
    selection.level4 !==
    ALL_GROUPS_KEY
  ) {
    return {
      ...selection,

      level4:
        ALL_GROUPS_KEY,
    };
  }

  if (
    selection.level3 !==
    ALL_GROUPS_KEY
  ) {
    return {
      ...selection,

      level3:
        ALL_GROUPS_KEY,

      level4:
        ALL_GROUPS_KEY,
    };
  }

  if (
    selection.level2 !==
    ALL_GROUPS_KEY
  ) {
    return {
      ...selection,

      level2:
        ALL_GROUPS_KEY,

      level3:
        ALL_GROUPS_KEY,

      level4:
        ALL_GROUPS_KEY,
    };
  }

  return createEmptySelection();
}

function getSelectedPath(
  selection:
    DeviceGroupSelection,
) {
  return [
    selection.level1,
    selection.level2,
    selection.level3,
    selection.level4,
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
}

function getLevelInfo(
  level: GroupLevel,
) {
  switch (level) {
    case 1:
      return {
        eyebrow:
          "Local",

        title:
          "Selecione um local",

        description:
          "Escolha a unidade ou prédio.",
      };

    case 2:
      return {
        eyebrow:
          "Setor",

        title:
          "Selecione um setor",

        description:
          "Escolha o setor do local selecionado.",
      };

    case 3:
      return {
        eyebrow:
          "Subdivisão",

        title:
          "Selecione uma subdivisão",

        description:
          "Refine a seleção dentro do setor.",
      };

    case 4:
      return {
        eyebrow:
          "Área",

        title:
          "Selecione uma área",

        description:
          "Escolha a área específica.",
      };
  }
}

/* ==========================================
   ÍCONES
   ========================================== */

function IconBase({
  children,
  className = "h-4 w-4",
}: {
  children: ReactNode;

  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="5"
        width="18"
        height="12"
        rx="2"
      />

      <path d="M7 11h10" />

      <path d="M8 17v2" />

      <path d="M16 17v2" />
    </IconBase>
  );
}

function EquipmentSmallIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="6"
        width="18"
        height="10"
        rx="2"
      />

      <path d="M7 12h10" />
    </IconBase>
  );
}

function HierarchyIcon() {
  return (
    <IconBase>
      <path d="M6 4v5" />

      <path d="M6 9h12v5" />

      <path d="M6 9v5" />

      <circle
        cx="6"
        cy="4"
        r="2"
      />

      <circle
        cx="6"
        cy="17"
        r="2"
      />

      <circle
        cx="18"
        cy="17"
        r="2"
      />
    </IconBase>
  );
}

function FolderIcon() {
  return (
    <IconBase>
      <path d="M3 7h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />

      <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2" />
    </IconBase>
  );
}

function CheckIcon() {
  return (
    <IconBase className="h-4 w-4">
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

function CheckSmallIcon() {
  return (
    <IconBase>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

function PartialIcon() {
  return (
    <IconBase>
      <path d="M7 12h10" />
    </IconBase>
  );
}

function PlusIcon() {
  return (
    <IconBase>
      <path d="M12 5v14" />

      <path d="M5 12h14" />
    </IconBase>
  );
}

function ChevronIcon() {
  return (
    <IconBase className="h-3 w-3 text-slate-300">
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function ChevronLargeIcon() {
  return (
    <IconBase>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function ArrowLeftIcon() {
  return (
    <IconBase>
      <path d="M19 12H5" />

      <path d="m11 18-6-6 6-6" />
    </IconBase>
  );
}