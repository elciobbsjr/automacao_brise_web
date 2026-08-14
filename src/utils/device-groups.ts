import type {
  DashboardDevice,
} from "@/types/dashboard";

export const UNGROUPED_KEY =
  "__ungrouped__";

export const ALL_GROUPS_KEY =
  "__all__";

export function getDeviceGroupKey(
  device: DashboardDevice,
) {
  const group =
    device.config?.groupLevel1;

  if (
    !group ||
    group === "-"
  ) {
    return UNGROUPED_KEY;
  }

  return group;
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
    "forumeleitoral"
  ) {
    return "Fórum Eleitoral";
  }

  if (
    normalized ===
    "sede"
  ) {
    return "Sede";
  }

  return group;
}

export function getAvailableGroups(
  devices: DashboardDevice[],
) {
  const groups =
    new Set<string>();

  devices.forEach(
    (device) => {
      groups.add(
        getDeviceGroupKey(
          device,
        ),
      );
    },
  );

  return Array.from(
    groups,
  ).sort((a, b) => {
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
  });
}

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