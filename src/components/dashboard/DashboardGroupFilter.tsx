"use client";

import type {
  ReactNode,
} from "react";

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

type GroupTone =
  | "blue"
  | "cyan"
  | "indigo"
  | "violet";

export function DashboardGroupFilter({
  selection,
  level1Groups,
  level2Groups,
  level3Groups,
  level4Groups,
  onChange,
}: DashboardGroupFilterProps) {
  const selectedPath =
    getSelectedPath(
      selection,
    );

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl">
      {/* Fundo discreto */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/95 to-blue-50/45" />

      <div className="relative">
        {/* ======================================
            CABEÇALHO COMPACTO
            ====================================== */}

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LocationIcon />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Navegação por local
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Refine os equipamentos pela
                estrutura física.
              </p>
            </div>
          </div>

          {/* CAMINHO ATUAL */}

          <div className="flex max-w-full items-center gap-2">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Seleção atual
            </span>

            <div className="hidden h-4 w-px bg-slate-200 sm:block" />

            {selectedPath.length >
            0 ? (
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                {selectedPath.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-center gap-1.5"
                    >
                      {index >
                        0 && (
                        <ChevronIcon />
                      )}

                      <span className="rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-800">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Todos os locais
              </span>
            )}
          </div>
        </div>

        {/* ======================================
            NÍVEIS DA HIERARQUIA
            ====================================== */}

        <div className="divide-y divide-slate-100">
          {/* LOCAL */}

          <GroupLevelRow
            title="Local"
            description="Unidade ou prédio"
            tone="blue"
            icon={
              <BuildingIcon />
            }
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

          {/* SETOR */}

          {level2Groups.length >
            0 && (
            <GroupLevelRow
              title="Setor"
              description="Setor do local"
              tone="cyan"
              icon={
                <SectorIcon />
              }
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

          {/* SUBDIVISÃO */}

          {level3Groups.length >
            0 && (
            <GroupLevelRow
              title="Subdivisão"
              description="Divisão do setor"
              tone="indigo"
              icon={
                <SubdivisionIcon />
              }
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

          {/* ÁREA */}

          {level4Groups.length >
            0 && (
            <GroupLevelRow
              title="Área"
              description="Área específica"
              tone="violet"
              icon={
                <AreaIcon />
              }
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
      </div>
    </section>
  );
}

/* ==========================================
   LINHA DE NÍVEL
   ========================================== */

interface GroupLevelRowProps {
  title: string;

  description: string;

  tone: GroupTone;

  icon: ReactNode;

  groups: string[];

  selected: string;

  onChange: (
    value: string,
  ) => void;
}

function GroupLevelRow({
  title,
  description,
  tone,
  icon,
  groups,
  selected,
  onChange,
}: GroupLevelRowProps) {
  const styles = {
    blue: {
      icon:
        "bg-blue-50 text-blue-700",

      title:
        "text-blue-900",
    },

    cyan: {
      icon:
        "bg-cyan-50 text-cyan-700",

      title:
        "text-cyan-900",
    },

    indigo: {
      icon:
        "bg-indigo-50 text-indigo-700",

      title:
        "text-indigo-900",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-700",

      title:
        "text-violet-900",
    },
  };

  const current =
    styles[tone];

  return (
    <div className="grid gap-3 px-5 py-4 sm:px-6 lg:grid-cols-[155px_minmax(0,1fr)] lg:items-center">
      {/* TÍTULO DO NÍVEL */}

      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${current.icon}`}
        >
          {icon}
        </div>

        <div>
          <p
            className={`text-sm font-bold ${current.title}`}
          >
            {title}
          </p>

          <p className="text-[11px] text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* OPÇÕES */}

      <GroupRow
        groups={groups}
        selected={selected}
        tone={tone}
        onChange={
          onChange
        }
      />
    </div>
  );
}

/* ==========================================
   GRUPOS
   ========================================== */

interface GroupRowProps {
  groups: string[];

  selected: string;

  tone: GroupTone;

  onChange: (
    value: string,
  ) => void;
}

function GroupRow({
  groups,
  selected,
  tone,
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
        tone={tone}
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
            tone={tone}
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

/* ==========================================
   BOTÃO
   ========================================== */

interface GroupButtonProps {
  label: string;

  active: boolean;

  tone: GroupTone;

  onClick: () => void;
}

function GroupButton({
  label,
  active,
  tone,
  onClick,
}: GroupButtonProps) {
  const styles = {
    blue: {
      active:
        "border-blue-600 bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.18)]",

      inactive:
        "border-slate-200 bg-white/80 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800",
    },

    cyan: {
      active:
        "border-cyan-700 bg-cyan-700 text-white shadow-[0_4px_12px_rgba(14,116,144,0.16)]",

      inactive:
        "border-slate-200 bg-white/80 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800",
    },

    indigo: {
      active:
        "border-indigo-600 bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.16)]",

      inactive:
        "border-slate-200 bg-white/80 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800",
    },

    violet: {
      active:
        "border-violet-600 bg-violet-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.16)]",

      inactive:
        "border-slate-200 bg-white/80 text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800",
    },
  };

  const current =
    styles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition duration-200 ${
        active
          ? current.active
          : current.inactive
      }`}
    >
      {active && (
        <CheckIcon />
      )}

      <span>
        {label}
      </span>
    </button>
  );
}

/* ==========================================
   CAMINHO SELECIONADO
   ========================================== */

function getSelectedPath(
  selection:
    DeviceGroupSelection,
) {
  const values = [
    selection.level1,
    selection.level2,
    selection.level3,
    selection.level4,
  ];

  return values
    .filter(
      (value) =>
        value !==
        ALL_GROUPS_KEY,
    )
    .map((value) =>
      formatDeviceGroupName(
        value,
      ),
    );
}

/* ==========================================
   ÍCONES
   ========================================== */

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />

      <path d="M17 9h2a2 2 0 0 1 2 2v10" />

      <path d="M8 7h5" />

      <path d="M8 11h5" />

      <path d="M8 15h5" />

      <path d="M9 21v-3h3v3" />
    </svg>
  );
}

function SectorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
    </svg>
  );
}

function SubdivisionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 4v5" />

      <path d="M6 9h12v6" />

      <path d="M6 9v6" />

      <circle
        cx="6"
        cy="4"
        r="2"
      />

      <circle
        cx="6"
        cy="18"
        r="2"
      />

      <circle
        cx="18"
        cy="18"
        r="2"
      />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 7 9 4l6 3 5-3v13l-5 3-6-3-5 3Z" />

      <path d="M9 4v13" />

      <path d="M15 7v13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 shrink-0 text-blue-300"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}