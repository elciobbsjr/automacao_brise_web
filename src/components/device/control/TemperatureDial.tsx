interface TemperatureDialProps {
  value: number;
  enabled: boolean;

  min?: number;
  max?: number;

  onDecrease: () => void;
  onIncrease: () => void;
}

export function TemperatureDial({
  value,
  enabled,
  min = 18,
  max = 28,
  onDecrease,
  onIncrease,
}: TemperatureDialProps) {
  const normalized =
    Math.min(
      1,
      Math.max(
        0,
        (value - min) /
          (max - min),
      ),
    );

  const rotation =
    -135 +
    normalized * 270;

  return (
    <div className="py-3">
      <div className="relative mx-auto flex h-[260px] w-[260px] items-center justify-center">
        <div
          className="absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
          style={{
            background:
              "conic-gradient(from 225deg, #38bdf8 0deg, #3b82f6 100deg, #8b5cf6 180deg, #ec4899 225deg, #ef4444 270deg, #e2e8f0 270deg, #e2e8f0 360deg)",
          }}
        />

        <div className="absolute inset-[14px] rounded-full bg-white" />

        <div className="absolute inset-[27px] rounded-full border border-slate-100 bg-white shadow-inner" />

        {enabled && (
          <span
            className="absolute left-1/2 top-1/2 h-[105px] w-[3px] origin-bottom -translate-x-1/2 -translate-y-full"
            style={{
              transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
            }}
          >
            <span className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
          </span>
        )}

        <div className="relative z-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Temperatura alvo
          </p>

          <div className="mt-2 flex items-start justify-center">
            <span className="text-6xl font-bold tracking-tighter text-slate-900">
              {enabled
                ? value
                : "--"}
            </span>

            {enabled && (
              <span className="mt-2 text-lg font-bold text-slate-700">
                °C
              </span>
            )}
          </div>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {min} °C — {max} °C
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-4 flex max-w-[300px] items-center justify-between">
        <TemperatureButton
          disabled={
            !enabled ||
            value <= min
          }
          onClick={
            onDecrease
          }
          label="Diminuir temperatura"
        >
          −
        </TemperatureButton>

        <TemperatureButton
          disabled={
            !enabled ||
            value >= max
          }
          onClick={
            onIncrease
          }
          label="Aumentar temperatura"
        >
          +
        </TemperatureButton>
      </div>
    </div>
  );
}

function TemperatureButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-3xl font-light text-blue-600 shadow-lg shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:text-slate-300 disabled:opacity-50"
    >
      {children}
    </button>
  );
}