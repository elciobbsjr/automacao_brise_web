"use client";

import {
  useMemo,
  type ReactNode,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import type {
  DeviceFilter,
} from "./DeviceFilters";

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

interface StatusGroupNavigatorProps {
  /*
   * Lista completa de dispositivos.
   */
  devices: DashboardDevice[];

  /*
   * Filtro selecionado através
   * dos cards do monitoramento:
   *
   * all
   * on
   * off
   * offline
   */
  filter: DeviceFilter;

  /*
   * Caminho atual da hierarquia.
   */
  selection:
    DeviceGroupSelection;

  /*
   * Atualiza a seleção de grupos
   * no componente pai.
   */
  onSelectionChange: (
    selection:
      DeviceGroupSelection,
  ) => void;

  /*
   * Chamado quando chegamos ao
   * último nível disponível.
   *
   * Posteriormente o
   * DashboardDevices utilizará
   * isso para trocar da navegação
   * para os cards dos equipamentos.
   */
  onLeafReached?: (
    selection:
      DeviceGroupSelection,
  ) => void;
}

/* ==========================================
   COMPONENTE
   ========================================== */

export function StatusGroupNavigator({
  devices,
  filter,
  selection,
  onSelectionChange,
  onLeafReached,
}: StatusGroupNavigatorProps) {
  /*
   * Primeiro aplicamos somente
   * o estado selecionado.
   *
   * Isso garante que, por exemplo,
   * ao clicar em "Ligados",
   * apareçam apenas grupos que
   * realmente possuem equipamentos
   * ligados.
   */
  const statusDevices =
    useMemo(
      () =>
        filterDevicesByStatus(
          devices,
          filter,
        ),
      [
        devices,
        filter,
      ],
    );

  /*
   * Depois aplicamos o caminho
   * hierárquico já escolhido.
   */
  const branchDevices =
    useMemo(
      () =>
        filterDevicesByHierarchy(
          statusDevices,
          selection,
        ),
      [
        statusDevices,
        selection,
      ],
    );

  /*
   * Descobre qual nível deve
   * ser exibido agora.
   *
   * Exemplo:
   *
   * nenhum selecionado
   * → nível 1 = Local
   *
   * Sede selecionada
   * → nível 2 = Setor
   *
   * Sede + SEMEQ
   * → nível 3 = Subdivisão
   */
  const currentLevel =
    getCurrentLevel(
      selection,
    );

  /*
   * Obtém somente os grupos
   * disponíveis naquele nível
   * para o status selecionado.
   */
  const availableGroups =
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
          statusDevices,
        );
      }

      return getAvailableGroupsAtLevel(
        statusDevices,
        currentLevel,
        selection,
      );
    }, [
      currentLevel,
      selection,
      statusDevices,
    ]);

  /*
   * Monta os cards dos grupos
   * já com a quantidade de
   * equipamentos correspondente.
   */
  const groupItems =
    useMemo(
      () =>
        availableGroups.map(
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

            const count =
              filterDevicesByHierarchy(
                statusDevices,
                nextSelection,
              ).length;

            return {
              key: group,

              label:
                formatDeviceGroupName(
                  group,
                ),

              count,

              selection:
                nextSelection,
            };
          },
        ).filter(
          (
            item,
          ): item is GroupItem =>
            item !== null &&
            item.count > 0,
        ),
      [
        availableGroups,
        currentLevel,
        selection,
        statusDevices,
      ],
    );

  const statusInfo =
    getStatusInfo(
      filter,
    );

  const levelInfo =
    currentLevel !== null
      ? getLevelInfo(
          currentLevel,
        )
      : null;

  const selectedPath =
    getSelectedPath(
      selection,
    );

  const canGoBack =
    selectedPath.length > 0;

  /*
   * Seleção de um grupo.
   */
  function handleGroupClick(
    item: GroupItem,
  ) {
    const selectedLevel =
      currentLevel;

    if (
      selectedLevel === null
    ) {
      return;
    }

    /*
     * Atualiza a hierarquia.
     */
    onSelectionChange(
      item.selection,
    );

    /*
     * Nível 4 é sempre o
     * último nível possível.
     */
    if (
      selectedLevel === 4
    ) {
      onLeafReached?.(
        item.selection,
      );

      return;
    }

    const nextLevel =
      (selectedLevel +
        1) as GroupLevel;

    /*
     * Verifica se existem grupos
     * abaixo do grupo selecionado.
     */
    const childGroups =
      getAvailableGroupsAtLevel(
        statusDevices,
        nextLevel,
        item.selection,
      );

    /*
     * Se não houver mais níveis,
     * chegamos nos equipamentos.
     */
    if (
      childGroups.length === 0
    ) {
      onLeafReached?.(
        item.selection,
      );
    }
  }

  /*
   * Volta um nível da hierarquia
   * sem remover o filtro de status.
   */
  function handleBack() {
    const previousSelection =
      goBackOneLevel(
        selection,
      );

    onSelectionChange(
      previousSelection,
    );
  }

  /*
   * Caso toda a hierarquia já
   * esteja preenchida.
   */
  if (
    currentLevel === null
  ) {
    return (
      <section
        className={`relative overflow-hidden rounded-[26px] border bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl ${statusInfo.border}`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-[3px] ${statusInfo.accent}`}
        />

        <div className="p-5 sm:p-6">
          <HierarchyHeader
            title={
              statusInfo.title
            }
            description={`${branchDevices.length} ${formatEquipmentCount(
              branchDevices.length,
              filter,
            )} nesta seleção.`}
            icon={
              statusInfo.icon
            }
            iconStyle={
              statusInfo.iconStyle
            }
          />

          <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-5 text-center">
            <p className="text-sm font-bold text-slate-900">
              Hierarquia concluída
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Todos os níveis
              disponíveis foram
              selecionados.
            </p>

            <button
              type="button"
              onClick={() =>
                onLeafReached?.(
                  selection,
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ver equipamentos

              <ArrowRightIcon />
            </button>
          </div>

          {canGoBack && (
            <BackButton
              onClick={
                handleBack
              }
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-[26px] border bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl ${statusInfo.border}`}
    >
      {/* LINHA DE STATUS */}

      <div
        className={`absolute inset-x-0 top-0 h-[3px] ${statusInfo.accent}`}
      />

      {/* FUNDO */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white/90 to-slate-50/70" />

      <div className="relative p-5 sm:p-6">
        {/* ======================================
            CABEÇALHO
            ====================================== */}

        <HierarchyHeader
          title={
            statusInfo.title
          }
          description={`${statusDevices.length} ${formatEquipmentCount(
            statusDevices.length,
            filter,
          )} encontrados.`}
          icon={
            statusInfo.icon
          }
          iconStyle={
            statusInfo.iconStyle
          }
        />

        {/* ======================================
            CAMINHO ATUAL
            ====================================== */}

        {selectedPath.length >
          0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Caminho
            </span>

            <StatusBadge
              label={
                statusInfo.shortLabel
              }
              className={
                statusInfo.badge
              }
            />

            {selectedPath.map(
              (
                item,
                index,
              ) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-2"
                >
                  <ChevronRightIcon />

                  <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {item}
                  </span>
                </div>
              ),
            )}
          </div>
        )}

        {/* ======================================
            NÍVEL ATUAL
            ====================================== */}

        <div className="mt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {levelInfo?.eyebrow}
              </p>

              <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                {levelInfo?.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {levelInfo?.description}
              </p>
            </div>

            <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold text-slate-500">
                {groupItems.length}{" "}
                {groupItems.length === 1
                  ? "grupo disponível"
                  : "grupos disponíveis"}
              </span>
            </div>
          </div>

          {/* ==================================
              GRUPOS
              ================================== */}

          {groupItems.length >
          0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groupItems.map(
                (item) => (
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
                    filter={
                      filter
                    }
                    tone={
                      statusInfo.tone
                    }
                    onClick={() =>
                      handleGroupClick(
                        item,
                      )
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <NoGroupsState
              count={
                branchDevices.length
              }
              filter={
                filter
              }
              onShowDevices={() =>
                onLeafReached?.(
                  selection,
                )
              }
            />
          )}
        </div>

        {/* ======================================
            VOLTAR
            ====================================== */}

        {canGoBack && (
          <BackButton
            onClick={
              handleBack
            }
          />
        )}
      </div>
    </section>
  );
}

/* ==========================================
   CARD DE GRUPO
   ========================================== */

interface GroupItem {
  key: string;

  label: string;

  count: number;

  selection:
    DeviceGroupSelection;
}

type StatusTone =
  | "blue"
  | "emerald"
  | "slate"
  | "amber";

function GroupCard({
  label,
  count,
  filter,
  tone,
  onClick,
}: {
  label: string;

  count: number;

  filter: DeviceFilter;

  tone: StatusTone;

  onClick: () => void;
}) {
  const styles = {
    blue: {
      box:
        "border-blue-100 hover:border-blue-200 hover:bg-blue-50/60",

      icon:
        "bg-blue-50 text-blue-700",

      count:
        "bg-blue-50 text-blue-700 border-blue-100",
    },

    emerald: {
      box:
        "border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/60",

      icon:
        "bg-emerald-50 text-emerald-700",

      count:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
    },

    slate: {
      box:
        "border-slate-200 hover:border-slate-300 hover:bg-slate-50",

      icon:
        "bg-slate-100 text-slate-600",

      count:
        "bg-slate-100 text-slate-600 border-slate-200",
    },

    amber: {
      box:
        "border-amber-100 hover:border-amber-200 hover:bg-amber-50/60",

      icon:
        "bg-amber-50 text-amber-700",

      count:
        "bg-amber-50 text-amber-700 border-amber-100",
    },
  };

  const current =
    styles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-2xl border bg-white/80 p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${current.box}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
      >
        <BuildingIcon />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-950">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {count}{" "}
          {formatEquipmentCount(
            count,
            filter,
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`hidden rounded-lg border px-2.5 py-1 text-xs font-bold sm:inline-flex ${current.count}`}
        >
          {count}
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition group-hover:border-slate-300 group-hover:text-slate-700">
          <ChevronRightLargeIcon />
        </span>
      </div>
    </button>
  );
}

/* ==========================================
   CABEÇALHO
   ========================================== */

function HierarchyHeader({
  title,
  description,
  icon,
  iconStyle,
}: {
  title: string;

  description: string;

  icon: ReactNode;

  iconStyle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Navegação por status
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   SEM GRUPOS ABAIXO
   ========================================== */

function NoGroupsState({
  count,
  filter,
  onShowDevices,
}: {
  count: number;

  filter: DeviceFilter;

  onShowDevices: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/75 p-5 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        <AirConditionerIcon />
      </div>

      <h4 className="mt-3 text-sm font-bold text-slate-900">
        Nenhuma subdivisão
        adicional
      </h4>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        Existem {count}{" "}
        {formatEquipmentCount(
          count,
          filter,
        )} diretamente nesta
        seleção.
      </p>

      <button
        type="button"
        onClick={
          onShowDevices
        }
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Ver equipamentos

        <ArrowRightIcon />
      </button>
    </div>
  );
}

/* ==========================================
   VOLTAR
   ========================================== */

function BackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeftIcon />

        Voltar um nível
      </button>
    </div>
  );
}

/* ==========================================
   BADGE
   ========================================== */

function StatusBadge({
  label,
  className,
}: {
  label: string;

  className: string;
}) {
  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}

/* ==========================================
   FILTRO POR STATUS
   ========================================== */

function filterDevicesByStatus(
  devices: DashboardDevice[],
  filter: DeviceFilter,
) {
  if (
    filter === "on"
  ) {
    return devices.filter(
      (device) =>
        device.online &&
        device.variables
          ?.state === true,
    );
  }

  if (
    filter === "off"
  ) {
    return devices.filter(
      (device) =>
        device.online &&
        device.variables
          ?.state !== true,
    );
  }

  if (
    filter === "offline"
  ) {
    return devices.filter(
      (device) =>
        !device.online,
    );
  }

  return devices;
}

/* ==========================================
   NÍVEL ATUAL
   ========================================== */

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

/* ==========================================
   CRIA SELEÇÃO PARA O NÍVEL
   ========================================== */

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

/* ==========================================
   VOLTA UM NÍVEL
   ========================================== */

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

/* ==========================================
   CAMINHO SELECIONADO
   ========================================== */

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

/* ==========================================
   INFORMAÇÕES DO STATUS
   ========================================== */

function getStatusInfo(
  filter: DeviceFilter,
) {
  if (
    filter === "on"
  ) {
    return {
      title:
        "Equipamentos ligados",

      shortLabel:
        "Ligados",

      tone:
        "emerald" as StatusTone,

      border:
        "border-emerald-100/90",

      accent:
        "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400",

      iconStyle:
        "bg-emerald-50 text-emerald-700",

      badge:
        "border-emerald-100 bg-emerald-50 text-emerald-700",

      icon: (
        <PowerIcon />
      ),
    };
  }

  if (
    filter === "off"
  ) {
    return {
      title:
        "Equipamentos desligados",

      shortLabel:
        "Desligados",

      tone:
        "slate" as StatusTone,

      border:
        "border-slate-200",

      accent:
        "bg-gradient-to-r from-slate-600 via-slate-500 to-blue-400",

      iconStyle:
        "bg-slate-100 text-slate-600",

      badge:
        "border-slate-200 bg-slate-100 text-slate-600",

      icon: (
        <PowerOffIcon />
      ),
    };
  }

  if (
    filter === "offline"
  ) {
    return {
      title:
        "Equipamentos sem resposta",

      shortLabel:
        "Sem resposta",

      tone:
        "amber" as StatusTone,

      border:
        "border-amber-100/90",

      accent:
        "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-400",

      iconStyle:
        "bg-amber-50 text-amber-700",

      badge:
        "border-amber-100 bg-amber-50 text-amber-700",

      icon: (
        <OfflineIcon />
      ),
    };
  }

  return {
    title:
      "Todos os equipamentos",

    shortLabel:
      "Equipamentos",

    tone:
      "blue" as StatusTone,

    border:
      "border-blue-100/90",

    accent:
      "bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-400",

    iconStyle:
      "bg-blue-50 text-blue-700",

    badge:
      "border-blue-100 bg-blue-50 text-blue-700",

    icon: (
      <EquipmentIcon />
    ),
  };
}

/* ==========================================
   INFORMAÇÕES DO NÍVEL
   ========================================== */

function getLevelInfo(
  level: GroupLevel,
) {
  switch (level) {
    case 1:
      return {
        eyebrow:
          "Nível 1",

        title:
          "Selecione um local",

        description:
          "Escolha a unidade ou prédio que deseja consultar.",
      };

    case 2:
      return {
        eyebrow:
          "Nível 2",

        title:
          "Selecione um setor",

        description:
          "Escolha um setor dentro do local selecionado.",
      };

    case 3:
      return {
        eyebrow:
          "Nível 3",

        title:
          "Selecione uma subdivisão",

        description:
          "Refine a consulta para uma subdivisão específica.",
      };

    case 4:
      return {
        eyebrow:
          "Nível 4",

        title:
          "Selecione uma área",

        description:
          "Escolha a área final para visualizar os equipamentos.",
      };
  }
}

/* ==========================================
   TEXTO DA QUANTIDADE
   ========================================== */

function formatEquipmentCount(
  count: number,
  filter: DeviceFilter,
) {
  if (
    filter === "on"
  ) {
    return count === 1
      ? "equipamento ligado"
      : "equipamentos ligados";
  }

  if (
    filter === "off"
  ) {
    return count === 1
      ? "equipamento desligado"
      : "equipamentos desligados";
  }

  if (
    filter === "offline"
  ) {
    return count === 1
      ? "equipamento sem resposta"
      : "equipamentos sem resposta";
  }

  return count === 1
    ? "equipamento"
    : "equipamentos";
}

/* ==========================================
   ÍCONES
   ========================================== */

function IconBase({
  children,
  className = "h-5 w-5",
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

function BuildingIcon() {
  return (
    <IconBase>
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />

      <path d="M17 9h2a2 2 0 0 1 2 2v10" />

      <path d="M8 7h5" />

      <path d="M8 11h5" />

      <path d="M8 15h5" />

      <path d="M9 21v-3h3v3" />
    </IconBase>
  );
}

function EquipmentIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2.5"
      />

      <path d="M7 8h10" />

      <path d="M8 14h.01" />

      <path d="M12 14h.01" />

      <path d="M16 14h.01" />
    </IconBase>
  );
}

function PowerIcon() {
  return (
    <IconBase>
      <path d="M12 2v10" />

      <path d="M6.4 5.6A8 8 0 1 0 17.6 5.6" />
    </IconBase>
  );
}

function PowerOffIcon() {
  return (
    <IconBase>
      <path d="M12 2v10" />

      <path d="M6.4 5.6A8 8 0 1 0 17.6 5.6" />

      <path d="M4 4 20 20" />
    </IconBase>
  );
}

function OfflineIcon() {
  return (
    <IconBase>
      <path d="M5 12.55a11 11 0 0 1 14.08-.67" />

      <path d="M1.42 9a16 16 0 0 1 21.16-.72" />

      <path d="M8.53 16.11a6 6 0 0 1 6.95-.11" />

      <path d="M12 20h.01" />

      <path d="M3 3 21 21" />
    </IconBase>
  );
}

function AirConditionerIcon() {
  return (
    <IconBase>
      <rect
        x="3"
        y="5"
        width="18"
        height="11"
        rx="2"
      />

      <path d="M7 11h10" />

      <path d="M8 16v2" />

      <path d="M12 16v3" />

      <path d="M16 16v2" />
    </IconBase>
  );
}

function ChevronRightIcon() {
  return (
    <IconBase className="h-3 w-3 text-slate-300">
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function ChevronRightLargeIcon() {
  return (
    <IconBase className="h-4 w-4">
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function ArrowRightIcon() {
  return (
    <IconBase className="h-4 w-4">
      <path d="M5 12h14" />

      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

function ArrowLeftIcon() {
  return (
    <IconBase className="h-4 w-4">
      <path d="M19 12H5" />

      <path d="m11 18-6-6 6-6" />
    </IconBase>
  );
}