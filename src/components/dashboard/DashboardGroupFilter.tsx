"use client";

import {
  ALL_GROUPS_KEY,
  formatDeviceGroupName,
  type DeviceGroupSelection,
  type GroupLevel,
} from "@/utils/device-groups";

interface DashboardGroupFilterProps {
  selection:
    DeviceGroupSelection;

  level1Groups: string[];

  level2Groups: string[];

  level3Groups: string[];

  level4Groups: string[];

  onChange: (
    level: GroupLevel,
    value: string,
  ) => void;
}

export function DashboardGroupFilter({
  selection,
  level1Groups,
  level2Groups,
  level3Groups,
  level4Groups,
  onChange,
}: DashboardGroupFilterProps) {
  return (
    <div className="space-y-4">
      {/* =================================
          NÍVEL 1
          ================================= */}
      <GroupRow
        groups={
          level1Groups
        }
        selected={
          selection.level1
        }
        onChange={(
          value,
        ) =>
          onChange(
            1,
            value,
          )
        }
      />

      {/* =================================
          NÍVEL 2
          ================================= */}
      {level2Groups.length >
        0 && (
        <GroupLevelSection
          title="Setores"
          groups={
            level2Groups
          }
          selected={
            selection.level2
          }
          onChange={(
            value,
          ) =>
            onChange(
              2,
              value,
            )
          }
        />
      )}

      {/* =================================
          NÍVEL 3
          ================================= */}
      {level3Groups.length >
        0 && (
        <GroupLevelSection
          title="Subdivisões"
          groups={
            level3Groups
          }
          selected={
            selection.level3
          }
          onChange={(
            value,
          ) =>
            onChange(
              3,
              value,
            )
          }
        />
      )}

      {/* =================================
          NÍVEL 4
          ================================= */}
      {level4Groups.length >
        0 && (
        <GroupLevelSection
          title="Áreas"
          groups={
            level4Groups
          }
          selected={
            selection.level4
          }
          onChange={(
            value,
          ) =>
            onChange(
              4,
              value,
            )
          }
        />
      )}
    </div>
  );
}

interface GroupLevelSectionProps {
  title: string;

  groups: string[];

  selected: string;

  onChange: (
    value: string,
  ) => void;
}

function GroupLevelSection({
  title,
  groups,
  selected,
  onChange,
}: GroupLevelSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-slate-400" />

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
      </div>

      <GroupRow
        groups={groups}
        selected={selected}
        onChange={
          onChange
        }
      />
    </div>
  );
}

interface GroupRowProps {
  groups: string[];

  selected: string;

  onChange: (
    value: string,
  ) => void;
}

function GroupRow({
  groups,
  selected,
  onChange,
}: GroupRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <GroupButton
        label="Todos"
        active={
          selected ===
          ALL_GROUPS_KEY
        }
        onClick={() =>
          onChange(
            ALL_GROUPS_KEY,
          )
        }
      />

      {groups.map(
        (group) => (
          <GroupButton
            key={group}
            label={formatDeviceGroupName(
              group,
            )}
            active={
              selected ===
              group
            }
            onClick={() =>
              onChange(
                group,
              )
            }
          />
        ),
      )}
    </div>
  );
}

interface GroupButtonProps {
  label: string;

  active: boolean;

  onClick: () => void;
}

function GroupButton({
  label,
  active,
  onClick,
}: GroupButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}