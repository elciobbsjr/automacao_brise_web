"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { DashboardDevice } from "@/types/dashboard";

import { ScheduleForm } from "./ScheduleForm";
import { ScheduleList } from "./ScheduleList";

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
  const [mounted, setMounted] =
    useState(false);

  const [tab, setTab] =
    useState<ScheduleTab>("list");

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
      document.body.style.overflow;

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

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Agendamentos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Gerencie e crie agendamentos dos dispositivos Brise.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Fechar
          </button>
        </header>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() =>
              setTab("list")
            }
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              tab === "list"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Agendamentos existentes
          </button>

          <button
            type="button"
            onClick={() =>
              setTab("create")
            }
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              tab === "create"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Novo agendamento
          </button>
        </div>

        {tab === "list" ? (
          <ScheduleList
            devices={devices}
          />
        ) : (
          <ScheduleForm
            devices={devices}
            onCreated={() =>
              setTab("list")
            }
          />
        )}
      </div>
    </div>,
    document.body,
  );
}