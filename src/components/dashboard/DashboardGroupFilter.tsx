"use client";

import {
  ALL_GROUPS_KEY,
  formatDeviceGroupName,
} from "@/utils/device-groups";

interface DashboardGroupFilterProps {
  groups: string[];

  selectedGroup: string;

  onChange: (
    group: string,
  ) => void;
}

export function DashboardGroupFilter({
  groups,
  selectedGroup,
  onChange,
}: DashboardGroupFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          onChange(
            ALL_GROUPS_KEY,
          )
        }
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          selectedGroup ===
          ALL_GROUPS_KEY
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Todos
      </button>

      {groups.map(
        (group) => (
          <button
            key={group}
            type="button"
            onClick={() =>
              onChange(
                group,
              )
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedGroup ===
              group
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {formatDeviceGroupName(
              group,
            )}
          </button>
        ),
      )}
    </div>
  );
}