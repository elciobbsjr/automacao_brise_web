"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import type {
  GroupedSchedule,
} from "@/types/schedule";

import type {
  DashboardDevice,
} from "@/types/dashboard";

import {
  WEEK_DAYS,
} from "@/constants/schedule";

import {
  createUnixTimestamp,
  decodeWeekDays,
  encodeWeekDays,
} from "@/utils/schedule";

import {
  updateBatchSchedule,
} from "@/services/schedule.service";

import {
  TemperatureDial,
} from "@/components/device/control/TemperatureDial";

interface ScheduleEditModalProps {
  schedule: GroupedSchedule | null;
  devices: DashboardDevice[];
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60";

export function ScheduleEditModal({
  schedule,
  devices,
  open,
  onClose,
  onUpdated,
}: ScheduleEditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [modeDevice, setModeDevice] = useState(1);
  const [modeAC, setModeAC] = useState(0);
  const [setpointCool, setSetpointCool] = useState(23);
  const [setpointHeat, setSetpointHeat] = useState(22);
  const [fanSpeed, setFanSpeed] = useState(2);
  const [ecoCool, setEcoCool] = useState(25);
  const [ecoHeat, setEcoHeat] = useState(22);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isOff = modeDevice === 0;
  const temperatureMode = modeAC === 1 ? "heat" : modeAC === 3 ? "fan" : "cool";
  const currentTemperature = modeAC === 1 ? setpointHeat : setpointCool;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open || !schedule) return;

    const timeZone = getScheduleTimeZone(schedule, devices);
    const start = timestampToLocalParts(schedule.dateStart, timeZone);
    const end = timestampToLocalParts(schedule.dateEnd, timeZone);
    const parameter = schedule.parameter;

    setName(schedule.name ?? "");
    setSelectedDevices([...schedule.deviceIds]);
    setSelectedDays(decodeWeekDays(schedule.repetitionValue));
    setScheduleDate(start.date);
    setStartTime(start.time);
    setEndTime(end.time);
    setModeDevice(parameter?.modeDevice ?? 1);
    setModeAC(parameter?.modeAC ?? 0);
    setSetpointCool(parameter?.setpointCool || 23);
    setSetpointHeat(parameter?.setpointHeat || 22);
    setFanSpeed(parameter?.fanSpeed || 2);
    setEcoCool(parameter?.ecoCool || 25);
    setEcoHeat(parameter?.ecoHeat || 22);
    setEnabled(schedule.enable);
    setMessage("");
  }, [open, schedule, devices]);

  if (!open || !mounted || !schedule) return null;

  const currentSchedule = schedule;
  const allSelected = selectedDevices.length === currentSchedule.deviceIds.length;

  function toggleDevice(deviceId: number) {
    setSelectedDevices((current) =>
      current.includes(deviceId)
        ? current.filter((id) => id !== deviceId)
        : [...current, deviceId],
    );
  }

  function toggleDay(day: number) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    );
  }

  function togglePowerOff(checked: boolean) {
    setModeDevice(checked ? 0 : modeDevice === 0 ? 1 : modeDevice);
  }

  function changeTemperature(value: number) {
    if (modeAC === 1) setSetpointHeat(value);
    else setSetpointCool(value);
  }

  async function handleUpdate() {
    if (!name.trim()) return setMessage("Informe um nome para o agendamento.");
    if (selectedDevices.length === 0) return setMessage("Selecione pelo menos um dispositivo.");
    if (selectedDays.length === 0) return setMessage("Selecione pelo menos um dia da semana.");
    if (!scheduleDate) return setMessage("Informe a data de referência.");
    if (!startTime || !endTime) return setMessage("Informe os horários inicial e final.");

    if (!isOff) {
      const targetTemperature = modeAC === 1 ? setpointHeat : setpointCool;
      if (modeAC !== 3 && (targetTemperature < 18 || targetTemperature > 28)) {
        return setMessage("A temperatura deve estar entre 18 °C e 28 °C.");
      }
      if (fanSpeed < 1 || fanSpeed > 3) return setMessage("Selecione uma velocidade de ventilação válida.");
    }

    const timeZone = getScheduleTimeZone(currentSchedule, devices);
    const dateStart = createUnixTimestamp(scheduleDate, startTime, timeZone);
    let dateEnd = createUnixTimestamp(scheduleDate, endTime, timeZone);

    if (dateEnd <= dateStart) dateEnd += 24 * 60 * 60;

    const repetitionValue = encodeWeekDays(selectedDays);
    const confirmed = window.confirm(
      `Salvar as alterações de "${name}" em ${selectedDevices.length} dispositivo(s)?`,
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("Salvando alterações...");

      const result = await updateBatchSchedule({
        scheduleId: currentSchedule.scheduleId,
        deviceIds: selectedDevices,
        name: name.trim(),
        enable: enabled,
        dateStart,
        dateEnd,
        repetitionMode: currentSchedule.repetitionMode,
        repetitionValue,
        parameter: {
          modeDevice,
          modeAC,
          fanSpeed,
          setpointCool,
          setpointHeat,
          ecoCool,
          ecoHeat,
        },
      });

      if (result.failureCount === 0) {
        setMessage(`Agendamento atualizado com sucesso em ${result.successCount} dispositivo(s).`);
        window.setTimeout(() => {
          onUpdated();
          onClose();
        }, 700);
        return;
      }

      setMessage(
        `Atualizado em ${result.successCount} dispositivo(s), mas houve falha em ${result.failureCount}.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao editar agendamento.");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-white/70 bg-slate-50 shadow-[0_28px_90px_rgba(15,23,42,0.30)]">
        <div className="h-1 shrink-0 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 py-4 sm:px-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarEditIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">Programação de climatização</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Editar agendamento</h2>
              <p className="mt-1 text-xs text-slate-500">ID {currentSchedule.scheduleId}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50">
            Fechar
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
            <div className="space-y-5">
              <Section icon={<TagIcon />} title="Identificação" description="Nomeie e escolha onde aplicar a programação.">
                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                    Nome do agendamento
                    <span className="font-medium text-slate-400">{name.length}/20</span>
                  </span>
                  <input type="text" maxLength={20} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                </label>

                <div className="mt-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Equipamentos</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{selectedDevices.length} de {currentSchedule.deviceIds.length} selecionado(s)</p>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setSelectedDevices([...currentSchedule.deviceIds])} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Selecionar todos</button>
                      <button type="button" onClick={() => setSelectedDevices([])} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Limpar</button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentSchedule.deviceIds.map((deviceId) => {
                      const selected = selectedDevices.includes(deviceId);
                      const device = devices.find((item) => item.deviceId === deviceId);
                      const deviceName = device?.config?.name || `Dispositivo ${deviceId}`;
                      return (
                        <label key={deviceId} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? "border-blue-300 bg-blue-50/70 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleDevice(deviceId)} className="h-4 w-4 accent-blue-600" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-800">{deviceName}</span>
                            <span className="mt-0.5 block text-[10px] text-slate-400">Nº {deviceId}</span>
                          </span>
                          {selected && <span className="ml-auto text-blue-600"><CheckIcon /></span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </Section>

              <Section icon={<CalendarIcon />} title="Período e repetição" description="Defina quando e em quais dias o agendamento será executado.">
                <div>
                  <p className="mb-2.5 text-xs font-bold text-slate-700">Dias da semana</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {WEEK_DAYS.map((day) => {
                      const selected = selectedDays.includes(day.value);
                      return (
                        <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`h-10 rounded-xl border text-[11px] font-bold transition ${selected ? "border-blue-600 bg-blue-600 text-white shadow-[0_5px_14px_rgba(37,99,235,0.18)]" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50"}`}>
                          {day.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-5">
                  <FieldLabel>Data de referência</FieldLabel>
                  <input type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} className={inputClass} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label>
                    <FieldLabel>Horário inicial</FieldLabel>
                    <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={inputClass} />
                  </label>
                  <label>
                    <FieldLabel>Horário final</FieldLabel>
                    <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className={inputClass} />
                  </label>
                </div>
              </Section>
            </div>

            <div className="space-y-5">
              <Section icon={<PowerIcon />} title="Ação do agendamento" description="Escolha se o equipamento será desligado ou receberá uma configuração.">
                <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${isOff ? "border-amber-300 bg-amber-50/80" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOff ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}><PowerIcon /></span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900">Desligar ar-condicionado</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">Ao executar, o equipamento receberá o comando para desligar.</span>
                    </span>
                  </span>
                  <input type="checkbox" checked={isOff} onChange={(event) => togglePowerOff(event.target.checked)} className="h-5 w-5 shrink-0 accent-blue-600" />
                </label>

                {!isOff && (
                  <div className="mt-5 space-y-5">
                    <div>
                      <FieldLabel>Modo de operação</FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {([{value:1,label:"Manual"},{value:2,label:"Absoluto"},{value:3,label:"Eco"}] as const).map((item) => (
                          <button key={item.value} type="button" onClick={() => setModeDevice(item.value)} className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${modeDevice === item.value ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Modo do ar-condicionado</FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {([{value:0,label:"Refrigeração",tone:"blue"},{value:1,label:"Aquecimento",tone:"orange"},{value:3,label:"Ventilar",tone:"cyan"}] as const).map((item) => (
                          <button key={item.value} type="button" onClick={() => setModeAC(item.value)} className={`rounded-xl border px-2 py-3 text-[11px] font-bold transition ${modeAC === item.value ? item.tone === "blue" ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100" : item.tone === "orange" ? "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-100" : "border-cyan-400 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-100" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {modeAC !== 3 && (
                      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">Temperatura desejada</p>
                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{currentTemperature} °C</span>
                        </div>
                        <TemperatureDial
                          value={currentTemperature}
                          enabled={true}
                          mode={temperatureMode}
                          min={18}
                          max={28}
                          onDecrease={() => changeTemperature(Math.max(18, currentTemperature - 1))}
                          onIncrease={() => changeTemperature(Math.min(28, currentTemperature + 1))}
                        />
                      </div>
                    )}

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <FieldLabel>Ventilação</FieldLabel>
                        <span className="text-[10px] font-semibold text-slate-400">{fanSpeed === 1 ? "Baixa" : fanSpeed === 2 ? "Média" : "Alta"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {([{value:1,label:"Baixa"},{value:2,label:"Média"},{value:3,label:"Alta"}] as const).map((item) => (
                          <button key={item.value} type="button" onClick={() => setFanSpeed(item.value)} className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${fanSpeed === item.value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {modeDevice === 3 && (
                      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                        <label>
                          <FieldLabel>Eco refrigeração</FieldLabel>
                          <input type="number" min={18} max={28} value={ecoCool} onChange={(event) => setEcoCool(Number(event.target.value))} className={inputClass} />
                        </label>
                        <label>
                          <FieldLabel>Eco aquecimento</FieldLabel>
                          <input type="number" min={18} max={28} value={ecoHeat} onChange={(event) => setEcoHeat(Number(event.target.value))} className={inputClass} />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              <Section icon={<ToggleIcon />} title="Estado do agendamento" description="Controla se esta programação ficará habilitada no sistema.">
                <button type="button" onClick={() => setEnabled((value) => !value)} className={`flex h-12 w-full items-center justify-between rounded-xl px-4 transition ${enabled ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  <span className="text-sm font-bold">{enabled ? "Agendamento ativo" : "Agendamento inativo"}</span>
                  <span className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} />
                  </span>
                </button>
              </Section>
            </div>
          </div>

          {message && (
            <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${message.includes("sucesso") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : message.includes("Salvando") ? "border-blue-200 bg-blue-50 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              {message}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[11px] text-slate-400">As alterações serão aplicadas somente aos equipamentos selecionados.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={handleUpdate} disabled={loading || selectedDevices.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Salvando..." : allSelected ? "Salvar em todos" : `Salvar em ${selectedDevices.length}`}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.045)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</span>
        <span>
          <span className="block text-sm font-bold text-slate-900">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
        </span>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-bold text-slate-700">{children}</span>;
}

function CalendarEditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M9 15h2M9 18h6" /></svg>;
}
function TagIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M20 13 11 22l-9-9V4h9Z" /><circle cx="7" cy="9" r="1.5" /></svg>;
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
}
function PowerIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M12 2v10" /><path d="M7.5 5.5a8 8 0 1 0 9 0" /></svg>;
}
function ToggleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="5" /><circle cx="8" cy="12" r="3" /></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

function getScheduleTimeZone(schedule: GroupedSchedule, devices: DashboardDevice[]) {
  const device = devices.find((item) => schedule.deviceIds.includes(item.deviceId));
  return device?.config?.timeZone ?? -3;
}

function timestampToLocalParts(timestamp: number, timeZone: number) {
  if (!Number.isFinite(timestamp)) return { date: "", time: "" };
  const localMilliseconds = timestamp * 1000 + timeZone * 60 * 60 * 1000;
  const date = new Date(localMilliseconds);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}` };
}
