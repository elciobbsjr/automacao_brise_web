"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  ScheduleForm,
} from "./ScheduleForm";

import {
  ScheduleList,
} from "./ScheduleList";

interface ScheduleModalProps {
  devices: DashboardDevice[];

  open: boolean;

  onClose: () => void;
}

type ScheduleTab =
  | "list"
  | "create";

export function ScheduleModal({
  devices,
  open,
  onClose,
}: ScheduleModalProps) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    tab,
    setTab,
  ] =
    useState<ScheduleTab>(
      "list",
    );

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTab("list");
    }
  }, [open]);

  /*
   * ESC fecha o modal.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  if (
    !open ||
    !mounted
  ) {
    return null;
  }

  const onlineDevices =
    devices.filter(
      (device) =>
        device.online,
    ).length;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-md sm:p-4"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[94vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-slate-50/95 shadow-[0_35px_110px_rgba(15,23,42,0.38)] backdrop-blur-2xl">
        {/* ==========================================
            FUNDO
            ========================================== */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/95 to-blue-50/70" />

          <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />

          <div className="absolute -bottom-40 left-[25%] h-[360px] w-[360px] rounded-full bg-cyan-100/20 blur-3xl" />

          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-slate-900 via-blue-600 to-cyan-400" />
        </div>

        {/* ==========================================
            CABEÇALHO
            ========================================== */}

        <header className="relative z-20 shrink-0 border-b border-slate-200/70 bg-white/80 px-5 py-5 backdrop-blur-2xl sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
                <CalendarIcon />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                    Programação
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    Brise · SEMEQ
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[28px]">
                  Agendamentos
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Gerencie horários,
                  repetições e parâmetros
                  de funcionamento dos
                  equipamentos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              aria-label="Fechar agendamentos"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/85 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              <CloseIcon />
            </button>
          </div>

          {/* ======================================
              INFORMAÇÕES DO MÓDULO
              ====================================== */}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <HeaderInfo
              icon={
                <EquipmentIcon />
              }
              value={String(
                devices.length,
              )}
              label={
                devices.length ===
                1
                  ? "equipamento"
                  : "equipamentos"
              }
            />

            <HeaderInfo
              icon={
                <OnlineIcon />
              }
              value={String(
                onlineDevices,
              )}
              label="online"
              tone="green"
            />

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            <span className="text-xs leading-5 text-slate-400">
              Os agendamentos são
              configurados individualmente
              por equipamento.
            </span>
          </div>
        </header>

        {/* ==========================================
            NAVEGAÇÃO
            ========================================== */}

        <div className="relative z-10 shrink-0 border-b border-slate-200/70 bg-white/55 px-5 py-3 backdrop-blur-xl sm:px-7">
          <div className="inline-flex rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5">
            <TabButton
              active={
                tab === "list"
              }
              icon={
                <ListIcon />
              }
              onClick={() =>
                setTab(
                  "list",
                )
              }
            >
              Agendamentos
            </TabButton>

            <TabButton
              active={
                tab ===
                "create"
              }
              icon={
                <PlusIcon />
              }
              onClick={() =>
                setTab(
                  "create",
                )
              }
            >
              Novo agendamento
            </TabButton>
          </div>
        </div>

        {/* ==========================================
            CONTEÚDO
            ========================================== */}

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7">
            {tab === "list" ? (
              <ScheduleList
                devices={
                  devices
                }
              />
            ) : (
              <ScheduleForm
                devices={
                  devices
                }
                onCreated={() =>
                  setTab(
                    "list",
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ==========================================
   ABA
   ========================================== */

function TabButton({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;

  icon:
    React.ReactNode;

  children:
    React.ReactNode;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition duration-200 ${
        active
          ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/70"
          : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
      }`}
    >
      <span
        className={
          active
            ? "text-blue-600"
            : "text-slate-400"
        }
      >
        {icon}
      </span>

      {children}
    </button>
  );
}

/* ==========================================
   INFORMAÇÃO DO CABEÇALHO
   ========================================== */

function HeaderInfo({
  icon,
  value,
  label,
  tone = "blue",
}: {
  icon:
    React.ReactNode;

  value: string;

  label: string;

  tone?:
    | "blue"
    | "green";
}) {
  const styles = {
    blue:
      "border-blue-100 bg-blue-50/70 text-blue-700",

    green:
      "border-emerald-100 bg-emerald-50/70 text-emerald-700",
  };

  return (
    <div
      className={`inline-flex h-8 items-center gap-2 rounded-xl border px-2.5 ${styles[tone]}`}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      <span className="text-xs font-bold">
        {value}
      </span>

      <span className="text-[10px] font-medium opacity-70">
        {label}
      </span>
    </div>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />

      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />

      <path d="M8 17h.01" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function EquipmentIcon() {
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
    </svg>
  );
}

function OnlineIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function ListIcon() {
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
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />

      <circle
        cx="4"
        cy="6"
        r="1"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="4"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="4"
        cy="18"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}