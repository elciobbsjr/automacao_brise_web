import type {
  DashboardDevice,
} from "@/types/dashboard";

export const UNGROUPED_KEY =
  "__ungrouped__";

export const ALL_GROUPS_KEY =
  "__all__";

export type GroupLevel =
  | 1
  | 2
  | 3
  | 4;

export interface DeviceGroupSelection {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
}

export function createDefaultGroupSelection(): DeviceGroupSelection {
  return {
    level1: ALL_GROUPS_KEY,
    level2: ALL_GROUPS_KEY,
    level3: ALL_GROUPS_KEY,
    level4: ALL_GROUPS_KEY,
  };
}

/*
 * Retorna o valor bruto de determinado
 * nível de grupo do dispositivo.
 */
function getRawGroupValue(
  device: DashboardDevice,
  level: GroupLevel,
): string | undefined | null {
  if (!device.config) {
    return null;
  }

  switch (level) {
    case 1:
      return device.config.groupLevel1;

    case 2:
      return device.config.groupLevel2;

    case 3:
      return device.config.groupLevel3;

    case 4:
      return device.config.groupLevel4;

    default:
      return null;
  }
}

/*
 * Verifica se o valor realmente representa
 * um grupo válido.
 *
 * A API usa "-" quando o nível não está
 * configurado.
 */
function isValidGroupValue(
  value?: string | null,
): value is string {
  if (!value) {
    return false;
  }

  const normalized =
    value.trim();

  return (
    normalized !== "" &&
    normalized !== "-"
  );
}

/*
 * Cria uma chave consistente para evitar,
 * por exemplo:
 *
 * FORUM
 * Forum
 * forum
 *
 * serem considerados grupos diferentes.
 */
function normalizeGroupKey(
  value: string,
) {
  const normalized =
    value
      .trim()
      .toLowerCase();

  const compact =
    normalized
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[\s_-]/g,
        "",
      );

  /*
   * Alguns equipamentos já apareceram
   * com nomes diferentes para o Fórum.
   */
  if (
    compact === "forum" ||
    compact ===
      "forumeleitoral"
  ) {
    return "forum-eleitoral";
  }

  if (compact === "sede") {
    return "sede";
  }

  return normalized;
}

/*
 * Retorna o grupo de um dispositivo
 * em determinado nível.
 */
export function getDeviceGroupAtLevel(
  device: DashboardDevice,
  level: GroupLevel,
): string | null {
  const value =
    getRawGroupValue(
      device,
      level,
    );

  if (
    !isValidGroupValue(
      value,
    )
  ) {
    return null;
  }

  return normalizeGroupKey(
    value,
  );
}

/*
 * Mantemos esta função porque o restante
 * do projeto ainda pode utilizá-la.
 *
 * Ela representa especificamente o nível 1.
 */
export function getDeviceGroupKey(
  device: DashboardDevice,
) {
  const group =
    getDeviceGroupAtLevel(
      device,
      1,
    );

  if (!group) {
    return UNGROUPED_KEY;
  }

  return group;
}

/*
 * Retorna toda a hierarquia do equipamento.
 *
 * Exemplo:
 *
 * Sede
 * └─ Administrativo
 *    └─ SEMEQ
 *       └─ Oficina
 */
export function getDeviceGroupPath(
  device: DashboardDevice,
) {
  return {
    level1:
      getDeviceGroupAtLevel(
        device,
        1,
      ),

    level2:
      getDeviceGroupAtLevel(
        device,
        2,
      ),

    level3:
      getDeviceGroupAtLevel(
        device,
        3,
      ),

    level4:
      getDeviceGroupAtLevel(
        device,
        4,
      ),
  };
}

export function formatDeviceGroupName(
  group: string,
) {
  if (
    group === ALL_GROUPS_KEY
  ) {
    return "Todos";
  }

  if (
    group === UNGROUPED_KEY
  ) {
    return "Sem grupo";
  }

  const normalized =
    group
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "forum-eleitoral"
  ) {
    return "Fórum Eleitoral";
  }

  if (
    normalized === "sede"
  ) {
    return "Sede";
  }

  if (
    normalized === "semeq"
  ) {
    return "SEMEQ";
  }

  /*
   * ADMINISTRATIVO
   * administrativo
   *
   * passam a aparecer como:
   *
   * Administrativo
   */
  return normalized
    .split(/\s+/)
    .map(
      (word) =>
        word.length > 0
          ? word
              .charAt(0)
              .toUpperCase() +
            word.slice(1)
          : word,
    )
    .join(" ");
}

/*
 * Compatibilidade com o filtro antigo.
 *
 * Retorna somente os locais de nível 1:
 *
 * Fórum Eleitoral
 * Sede
 * Sem grupo
 */
export function getAvailableGroups(
  devices: DashboardDevice[],
) {
  const groups =
    new Set<string>();

  let hasUngrouped = false;

  devices.forEach(
    (device) => {
      const group =
        getDeviceGroupAtLevel(
          device,
          1,
        );

      if (!group) {
        hasUngrouped = true;
        return;
      }

      groups.add(group);
    },
  );

  const result =
    Array.from(groups).sort(
      compareGroups,
    );

  if (hasUngrouped) {
    result.push(
      UNGROUPED_KEY,
    );
  }

  return result;
}

/*
 * Retorna as opções disponíveis para
 * determinado nível respeitando os níveis
 * selecionados acima dele.
 *
 * Exemplo:
 *
 * level1 = Sede
 *
 * getAvailableGroupsAtLevel(..., 2, ...)
 *
 * pode retornar:
 *
 * Administrativo
 * Manutenção
 * Engenharia
 */
export function getAvailableGroupsAtLevel(
  devices: DashboardDevice[],
  level: GroupLevel,
  selection: DeviceGroupSelection,
) {
  const groups =
    new Set<string>();

  const parentFiltered =
    filterByParentLevels(
      devices,
      level,
      selection,
    );

  parentFiltered.forEach(
    (device) => {
      const group =
        getDeviceGroupAtLevel(
          device,
          level,
        );

      if (group) {
        groups.add(group);
      }
    },
  );

  return Array.from(
    groups,
  ).sort(compareGroups);
}

/*
 * Faz o filtro completo da árvore.
 */
export function filterDevicesByHierarchy(
  devices: DashboardDevice[],
  selection: DeviceGroupSelection,
) {
  return devices.filter(
    (device) => {
      /*
       * LEVEL 1
       */
      if (
        selection.level1 !==
        ALL_GROUPS_KEY
      ) {
        const deviceLevel1 =
          getDeviceGroupAtLevel(
            device,
            1,
          );

        if (
          selection.level1 ===
          UNGROUPED_KEY
        ) {
          if (deviceLevel1) {
            return false;
          }
        } else if (
          deviceLevel1 !==
          selection.level1
        ) {
          return false;
        }
      }

      /*
       * LEVEL 2
       */
      if (
        selection.level2 !==
        ALL_GROUPS_KEY
      ) {
        if (
          getDeviceGroupAtLevel(
            device,
            2,
          ) !==
          selection.level2
        ) {
          return false;
        }
      }

      /*
       * LEVEL 3
       */
      if (
        selection.level3 !==
        ALL_GROUPS_KEY
      ) {
        if (
          getDeviceGroupAtLevel(
            device,
            3,
          ) !==
          selection.level3
        ) {
          return false;
        }
      }

      /*
       * LEVEL 4
       */
      if (
        selection.level4 !==
        ALL_GROUPS_KEY
      ) {
        if (
          getDeviceGroupAtLevel(
            device,
            4,
          ) !==
          selection.level4
        ) {
          return false;
        }
      }

      return true;
    },
  );
}

/*
 * Mantém compatibilidade com o código
 * antigo que filtra apenas groupLevel1.
 */
export function filterDevicesByGroup(
  devices: DashboardDevice[],
  group: string,
) {
  if (
    group === ALL_GROUPS_KEY
  ) {
    return devices;
  }

  return devices.filter(
    (device) =>
      getDeviceGroupKey(
        device,
      ) === group,
  );
}

/*
 * Informa se existem grupos abaixo de
 * determinado nível.
 */
export function hasGroupsAtLevel(
  devices: DashboardDevice[],
  level: GroupLevel,
  selection: DeviceGroupSelection,
) {
  return (
    getAvailableGroupsAtLevel(
      devices,
      level,
      selection,
    ).length > 0
  );
}

/*
 * Filtra somente pelos níveis anteriores.
 *
 * Isso é usado para descobrir quais opções
 * devem aparecer no próximo nível.
 */
function filterByParentLevels(
  devices: DashboardDevice[],
  level: GroupLevel,
  selection: DeviceGroupSelection,
) {
  return devices.filter(
    (device) => {
      if (level > 1) {
        if (
          selection.level1 !==
          ALL_GROUPS_KEY
        ) {
          const deviceLevel1 =
            getDeviceGroupAtLevel(
              device,
              1,
            );

          if (
            selection.level1 ===
            UNGROUPED_KEY
          ) {
            if (deviceLevel1) {
              return false;
            }
          } else if (
            deviceLevel1 !==
            selection.level1
          ) {
            return false;
          }
        }
      }

      if (level > 2) {
        if (
          selection.level2 !==
          ALL_GROUPS_KEY &&
          getDeviceGroupAtLevel(
            device,
            2,
          ) !==
            selection.level2
        ) {
          return false;
        }
      }

      if (level > 3) {
        if (
          selection.level3 !==
          ALL_GROUPS_KEY &&
          getDeviceGroupAtLevel(
            device,
            3,
          ) !==
            selection.level3
        ) {
          return false;
        }
      }

      return true;
    },
  );
}

function compareGroups(
  a: string,
  b: string,
) {
  if (
    a === UNGROUPED_KEY
  ) {
    return 1;
  }

  if (
    b === UNGROUPED_KEY
  ) {
    return -1;
  }

  return formatDeviceGroupName(
    a,
  ).localeCompare(
    formatDeviceGroupName(
      b,
    ),
    "pt-BR",
  );
}