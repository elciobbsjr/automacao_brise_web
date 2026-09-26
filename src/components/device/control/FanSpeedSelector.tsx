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
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Velocidade do ventilador
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Ajuste a intensidade do fluxo de ar.
          </p>
        </div>

        <FanIcon />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SpeedButton
          label="Baixa"
          level={1}
          active={
            value === 1
          }
          onClick={() =>
            onChange(1)
          }
        />

        <SpeedButton
          label="Média"
          level={2}
          active={
            value === 2
          }
          onClick={() =>
            onChange(2)
          }
        />

        <SpeedButton
          label="Alta"
          level={3}
          active={
            value === 3
          }
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
      className={`relative rounded-2xl border px-2 py-3 transition duration-200 hover:-translate-y-0.5 ${
        active
          ? "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/70 text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.12)]"
          : "border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300 hover:bg-white"
      }`}
    >
      {active && (
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
      )}

      <div className="flex h-7 items-end justify-center gap-1">
        {[1, 2, 3].map(
          (bar) => (
            <span
              key={bar}
              className={`w-1.5 rounded-full transition ${
                bar <= level
                  ? active
                    ? "bg-blue-500"
                    : "bg-slate-500"
                  : "bg-slate-200"
              }`}
              style={{
                height:
                  `${7 + bar * 5}px`,
              }}
            />
          ),
        )}
      </div>

      <p className="mt-2 text-[11px] font-bold">
        {label}
      </p>
    </button>
  );
}

function FanIcon() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="2"
        />

        <path d="M12 10c-1-4 1-7 3-7 2.5 0 3.5 4-1 7" />
        <path d="M14 12c4-1 7 1 7 3 0 2.5-4 3.5-7-1" />
        <path d="M12 14c1 4-1 7-3 7-2.5 0-3.5-4 1-7" />
        <path d="M10 12c-4 1-7-1-7-3 0-2.5 4-3.5 7 1" />
      </svg>
    </div>
  );
}