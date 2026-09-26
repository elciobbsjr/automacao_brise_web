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
}

export function ScheduleManager({
  devices,
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
        className="group flex h-11 w-full items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_10px_24px_rgba(15,23,42,0.18)] active:translate-y-0"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
            <CalendarIcon />
          </span>

          <span>
            Agendamentos
          </span>
        </span>

        <span className="text-slate-400 transition duration-200 group-hover:translate-x-0.5 group-hover:text-white">
          <ArrowRightIcon />
        </span>
      </button>

      <ScheduleModal
        devices={devices}
        open={open}
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