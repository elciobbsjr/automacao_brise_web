"use client";

import {
  useEffect,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  GroupDeviceControl,
} from "./GroupDeviceControl";

interface GroupDeviceControlModalProps {
  devices: DashboardDevice[];
  groupName: string;
  groupPath: string[];
  open: boolean;
  onClose: () => void;
}

export function GroupDeviceControlModal({
  devices,
  groupName,
  groupPath,
  open,
  onClose,
}: GroupDeviceControlModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const onlineCount =
    devices.filter(
      (device) => device.online,
    ).length;

  const offlineCount =
    devices.length -
    onlineCount;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-md sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Controle do grupo ${groupName}`}
        className="relative max-h-[94vh] w-[96vw] max-w-[620px] overflow-hidden rounded-[30px] border border-white/70 bg-slate-50/95 shadow-[0_35px_110px_rgba(15,23,42,0.38)] backdrop-blur-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/95 to-blue-50/75" />
          <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-slate-900 via-blue-600 to-cyan-400" />
        </div>

        <div className="relative flex max-h-[94vh] flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur-2xl sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm sm:flex">
                  <GroupControlIcon />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    Controle coletivo
                  </p>

                  <h2 className="mt-1 truncate text-2xl font-bold tracking-[-0.035em] text-slate-950">
                    {groupName}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {groupPath.join(" › ")}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      {onlineCount} online
                    </span>

                    <span className="rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      {offlineCount} offline
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
              >
                <CloseIcon />
              </button>
            </div>
          </header>

          <div className="overflow-y-auto p-5 sm:p-6">
            <div className="relative overflow-hidden rounded-[26px] border border-blue-100/80 bg-white/85 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-100/50 blur-3xl" />

              <div className="relative p-5 sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <RemoteIcon />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-950">
                      Controle do grupo
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Ajuste os equipamentos online deste grupo usando o mesmo padrão do controle individual.
                    </p>
                  </div>
                </div>

                <GroupDeviceControl
                  devices={devices}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupControlIcon() {
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
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

function RemoteIcon() {
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
        x="7"
        y="2"
        width="10"
        height="20"
        rx="3"
      />

      <path d="M10 6h4" />
      <circle cx="12" cy="11" r="2" />
      <path d="M10 16h.01" />
      <path d="M14 16h.01" />
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
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}