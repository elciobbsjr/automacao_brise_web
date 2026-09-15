"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type {
  GroupedSchedule,
} from "@/types/schedule";

import {
  deleteBatchSchedule,
} from "@/services/schedule.service";

interface ScheduleDeleteModalProps {
  schedule: GroupedSchedule | null;

  open: boolean;

  onClose: () => void;

  onDeleted: () => void;
}

export function ScheduleDeleteModal({
  schedule,
  open,
  onClose,
  onDeleted,
}: ScheduleDeleteModalProps) {
  const [mounted, setMounted] =
    useState(false);

  const [
    selectedDevices,
    setSelectedDevices,
  ] = useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open || !schedule) {
      return;
    }

    setSelectedDevices([]);
    setMessage("");
  }, [
    open,
    schedule,
  ]);

  if (
    !open ||
    !mounted ||
    !schedule
  ) {
    return null;
  }

  const currentSchedule =
    schedule;

  const allSelected =
    selectedDevices.length ===
    currentSchedule.deviceIds.length;

  function toggleDevice(
    deviceId: number,
  ) {
    setSelectedDevices(
      (current) =>
        current.includes(deviceId)
          ? current.filter(
              (id) =>
                id !== deviceId,
            )
          : [
              ...current,
              deviceId,
            ],
    );
  }

  function selectAll() {
    setSelectedDevices(
      currentSchedule.deviceIds,
    );
  }

  function clearSelection() {
    setSelectedDevices([]);
  }

  async function handleDelete() {
    if (
      selectedDevices.length === 0
    ) {
      setMessage(
        "Selecione pelo menos um dispositivo.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Excluir o agendamento "${currentSchedule.name}" de ${selectedDevices.length} dispositivo(s)?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      setMessage(
        "Excluindo agendamento...",
      );

      const result =
        await deleteBatchSchedule(
          currentSchedule.scheduleId,
          selectedDevices,
        );

      if (
        result.failureCount === 0
      ) {
        setMessage(
          `Agendamento excluído com sucesso de ${result.successCount} dispositivo(s).`,
        );

        window.setTimeout(
          () => {
            onDeleted();
            onClose();
          },
          700,
        );

        return;
      }

      setMessage(
        `Excluído de ${result.successCount} dispositivo(s), mas houve falha em ${result.failureCount}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao excluir agendamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Excluir agendamento
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {currentSchedule.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
          >
            Fechar
          </button>
        </header>

        <p className="mb-4 text-sm text-gray-600">
          Este agendamento está associado a{" "}
          <strong>
            {currentSchedule.devicesCount}
          </strong>{" "}
          dispositivo(s). Escolha de quais deseja removê-lo.
        </p>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
          >
            Selecionar todos
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
          >
            Limpar seleção
          </button>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {currentSchedule.deviceIds.map(
            (deviceId) => {
              const selected =
                selectedDevices.includes(
                  deviceId,
                );

              return (
                <label
                  key={deviceId}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                    selected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleDevice(
                        deviceId,
                      )
                    }
                  />

                  <span className="font-medium text-gray-800">
                    Dispositivo Nº{" "}
                    {deviceId}
                  </span>
                </label>
              );
            },
          )}
        </div>

        {message && (
          <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={
              loading ||
              selectedDevices.length ===
                0
            }
            className="rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Excluindo..."
              : allSelected
                ? "Excluir de todos"
                : `Excluir de ${selectedDevices.length}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}