interface FanSpeedSelectorProps {
  value: number;

  onChange: (
    value: number,
  ) => void;
}

export function FanSpeedSelector({
  value,
  onChange,
}: FanSpeedSelectorProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-700">
        Velocidade do ventilador
      </p>

      <div className="grid grid-cols-3 gap-2">
        <SpeedButton
          label="Baixa"
          level={1}
          active={value === 1}
          onClick={() =>
            onChange(1)
          }
        />

        <SpeedButton
          label="Média"
          level={2}
          active={value === 2}
          onClick={() =>
            onChange(2)
          }
        />

        <SpeedButton
          label="Alta"
          level={3}
          active={value === 3}
          onClick={() =>
            onChange(3)
          }
        />
      </div>
    </div>
  );
}

function SpeedButton({
  label,
  level,
  active,
  onClick,
}: {
  label: string;
  level: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-2 py-4 transition ${
        active
          ? "border-blue-300 bg-blue-50 text-blue-600 shadow-md"
          : "border-slate-200 bg-white/70 text-slate-500 hover:bg-white"
      }`}
    >
      <div className="flex h-7 items-end justify-center gap-1">
        {[1, 2, 3].map(
          (bar) => (
            <span
              key={bar}
              className={`w-2 rounded-sm ${
                bar <= level
                  ? active
                    ? "bg-blue-500"
                    : "bg-slate-500"
                  : "bg-slate-200"
              }`}
              style={{
                height:
                  `${8 + bar * 5}px`,
              }}
            />
          ),
        )}
      </div>

      <p className="mt-2 text-xs font-semibold">
        {label}
      </p>
    </button>
  );
}