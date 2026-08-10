"use client";

import { useState } from "react";

import type { DashboardDevice } from "@/types/dashboard";

import { ScheduleModal } from "./ScheduleModal";

interface ScheduleManagerProps {
  devices: DashboardDevice[];
}

export function ScheduleManager({
  devices,
}: ScheduleManagerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
      >
        Agendamentos
      </button>

      <ScheduleModal
        devices={devices}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}