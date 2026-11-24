"use client";

import {
  useState,
} from "react";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  ScheduleModal,
} from "./ScheduleModal";

interface ScheduleManagerProps {
  devices: DashboardDevice[];

  canManageSchedules: boolean;
}

export function ScheduleManager({
  devices,
  canManageSchedules,
}: ScheduleManagerProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 sm:px-3.5"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center text-slate-500 transition-colors group-hover:text-blue-700">
            <CalendarIcon />
          </span>

          <span>
            Agendamentos
          </span>
        </span>

        <span className="text-slate-400 transition-colors group-hover:text-blue-700">
          <ArrowRightIcon />
        </span>
      </button>

      <ScheduleModal
        devices={
          devices
        }
        open={
          open
        }
        canManageSchedules={
          canManageSchedules
        }
        onClose={() =>
          setOpen(false)
        }
      />
    </>
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
      className="h-4 w-4"
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

function ArrowRightIcon() {
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
      <path d="M5 12h14" />

      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}