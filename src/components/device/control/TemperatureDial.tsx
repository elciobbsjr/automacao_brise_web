export type TemperatureDialMode =
  | "cool"
  | "heat"
  | "fan"
  | "eco";

interface TemperatureDialProps {
  value: number;
  enabled: boolean;

  mode?: TemperatureDialMode;

  min?: number;
  max?: number;

  onDecrease: () => void;
  onIncrease: () => void;
}

export function TemperatureDial({
  value,
  enabled,
  mode = "cool",
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

  const themes = {
    cool: {
      marker:
        "#2563eb",

      glow:
        "rgba(37, 99, 235, 0.14)",

      ring: `
        repeating-conic-gradient(
          from 225deg,
          rgba(255,255,255,0.25) 0deg,
          rgba(255,255,255,0.25) 1deg,
          transparent 1deg,
          transparent 13.5deg
        ),
        conic-gradient(
          from 225deg,
          #22d3ee 0deg,
          #38bdf8 70deg,
          #2563eb 170deg,
          #4f46e5 270deg,
          #e2e8f0 270deg,
          #e2e8f0 360deg
        )
      `,
    },

    heat: {
      marker:
        "#ea580c",

      glow:
        "rgba(234, 88, 12, 0.14)",

      ring: `
        repeating-conic-gradient(
          from 225deg,
          rgba(255,255,255,0.24) 0deg,
          rgba(255,255,255,0.24) 1deg,
          transparent 1deg,
          transparent 13.5deg
        ),
        conic-gradient(
          from 225deg,
          #fbbf24 0deg,
          #f59e0b 80deg,
          #f97316 170deg,
          #dc2626 270deg,
          #e2e8f0 270deg,
          #e2e8f0 360deg
        )
      `,
    },

    fan: {
      marker:
        "#0891b2",

      glow:
        "rgba(8, 145, 178, 0.14)",

      ring: `
        repeating-conic-gradient(
          from 225deg,
          rgba(255,255,255,0.26) 0deg,
          rgba(255,255,255,0.26) 1deg,
          transparent 1deg,
          transparent 13.5deg
        ),
        conic-gradient(
          from 225deg,
          #67e8f9 0deg,
          #22d3ee 90deg,
          #0ea5e9 180deg,
          #0284c7 270deg,
          #e2e8f0 270deg,
          #e2e8f0 360deg
        )
      `,
    },

    eco: {
      marker:
        "#059669",

      glow:
        "rgba(5, 150, 105, 0.14)",

      ring: `
        repeating-conic-gradient(
          from 225deg,
          rgba(255,255,255,0.26) 0deg,
          rgba(255,255,255,0.26) 1deg,
          transparent 1deg,
          transparent 13.5deg
        ),
        conic-gradient(
          from 225deg,
          #6ee7b7 0deg,
          #34d399 80deg,
          #10b981 170deg,
          #0f766e 270deg,
          #e2e8f0 270deg,
          #e2e8f0 360deg
        )
      `,
    },
  };

  const theme =
    themes[mode];

  return (
    <div className="py-1">
      <div className="relative mx-auto flex h-[236px] w-[236px] items-center justify-center">
        {/* GLOW */}

        <div
          className="absolute inset-4 rounded-full blur-2xl"
          style={{
            backgroundColor:
              enabled
                ? theme.glow
                : "rgba(148,163,184,0.10)",
          }}
        />

        {/* ANEL */}

        <div
          className="absolute inset-0 rounded-full shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
          style={{
            background:
              enabled
                ? theme.ring
                : `
                  conic-gradient(
                    from 225deg,
                    #cbd5e1 0deg,
                    #e2e8f0 270deg,
                    #f1f5f9 270deg,
                    #f1f5f9 360deg
                  )
                `,
          }}
        />

        {/* RECORTE */}

        <div className="absolute inset-[12px] rounded-full bg-white" />

        {/* CENTRO */}

        <div className="absolute inset-[23px] rounded-full border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 shadow-[inset_0_3px_18px_rgba(15,23,42,0.035)]" />

        {/* MARCADOR DA TEMPERATURA */}

        {enabled && (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div
              className="absolute left-1/2 top-1/2 h-[96px] w-[2px] origin-bottom"
              style={{
                transform:
                  `translate(-50%, -100%) rotate(${rotation}deg)`,
              }}
            >
              <span
                className="absolute -top-[9px] left-1/2 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[4px] border-white shadow-[0_5px_14px_rgba(15,23,42,0.28)]"
                style={{
                  backgroundColor:
                    theme.marker,
                }}
              />
            </div>
          </div>
        )}

        {/* INFORMAÇÃO CENTRAL */}

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-2 flex w-fit items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50/80 px-2.5 py-1">
            <TemperatureIcon />

            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Temperatura alvo
            </span>
          </div>

          <div className="flex items-start justify-center">
            <span className="text-[52px] font-bold leading-none tracking-[-0.055em] text-slate-950">
              {enabled
                ? value
                : "--"}
            </span>

            {enabled && (
              <span className="ml-1 mt-1 text-base font-bold text-slate-600">
                °C
              </span>
            )}
          </div>

          <p className="mt-2 text-[10px] font-medium text-slate-400">
            {enabled
              ? `${min} °C — ${max} °C`
              : "Equipamento desligado"}
          </p>
        </div>
      </div>

      {/* CONTROLES */}

      <div className="mx-auto -mt-2 flex max-w-[270px] items-center justify-between px-2">
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

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 shadow-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              enabled
                ? "bg-emerald-500"
                : "bg-slate-300"
            }`}
          />

          {enabled
            ? "Ativo"
            : "Desligado"}
        </div>

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
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-light text-blue-600 shadow-[0_8px_20px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function TemperatureIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 text-blue-500"
      aria-hidden="true"
    >
      <path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z" />

      <path d="M10 5v10" />
    </svg>
  );
}