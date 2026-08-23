interface AdvancedSettingsProps {
  modeDevice: number;
  modeAC: number;

  setpointHeat: number;
  ecoCool: number;
  ecoHeat: number;

  onModeDeviceChange: (
    value: number,
  ) => void;

  onSetpointHeatChange: (
    value: number,
  ) => void;

  onEcoCoolChange: (
    value: number,
  ) => void;

  onEcoHeatChange: (
    value: number,
  ) => void;
}

export function AdvancedSettings({
  modeDevice,
  modeAC,
  setpointHeat,
  ecoCool,
  ecoHeat,
  onModeDeviceChange,
  onSetpointHeatChange,
  onEcoCoolChange,
  onEcoHeatChange,
}: AdvancedSettingsProps) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white/60 p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700">
        Configurações avançadas

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-slate-400 transition group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
        <Field
          label="Modo operacional"
        >
          <select
            value={modeDevice}
            onChange={(
              event,
            ) =>
              onModeDeviceChange(
                Number(
                  event.target
                    .value,
                ),
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value={0}>
              Desligado
            </option>

            <option value={1}>
              Manual
            </option>

            <option value={2}>
              Absoluto
            </option>

            <option value={3}>
              Eco
            </option>
          </select>
        </Field>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <NumberField
            label="Temp. aquecimento"
            value={
              setpointHeat
            }
            min={0}
            max={28}
            disabled={
              modeAC === 0 ||
              modeAC === 3
            }
            onChange={
              onSetpointHeatChange
            }
          />

          <NumberField
            label="Eco refrigeração"
            value={ecoCool}
            min={18}
            max={28}
            onChange={
              onEcoCoolChange
            }
          />

          <NumberField
            label="Eco aquecimento"
            value={ecoHeat}
            min={0}
            max={28}
            onChange={
              onEcoHeatChange
            }
          />
        </div>
      </div>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (
    value: number,
  ) => void;
}) {
  return (
    <label className="block rounded-xl bg-slate-50 p-3">
      <span className="block min-h-[30px] text-xs font-medium text-slate-500">
        {label}
      </span>

      <div className="mt-2 flex items-center">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(
            event,
          ) =>
            onChange(
              Number(
                event.target
                  .value,
              ),
            )
          }
          className="w-full bg-transparent text-xl font-bold text-slate-900 outline-none disabled:text-slate-400"
        />

        <span className="text-sm font-semibold text-slate-400">
          °C
        </span>
      </div>
    </label>
  );
}