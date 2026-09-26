interface ACModeSelectorProps {
  modeDevice: number;
  modeAC: number;

  onChange: (
    modeDevice: number,
    modeAC: number,
  ) => void;
}

type ModeTone =
  | "cool"
  | "heat"
  | "fan"
  | "eco";

export function ACModeSelector({
  modeDevice,
  modeAC,
  onChange,
}: ACModeSelectorProps) {
  function selectCooling() {
    onChange(
      modeDevice === 3
        ? 1
        : modeDevice,
      0,
    );
  }

  function selectHeating() {
    onChange(
      modeDevice === 3
        ? 1
        : modeDevice,
      1,
    );
  }

  function selectFan() {
    onChange(
      modeDevice === 3
        ? 1
        : modeDevice,
      3,
    );
  }

  function selectEco() {
    onChange(
      3,
      modeAC === 3
        ? 0
        : modeAC,
    );
  }

  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Modo
      </p>

      <div className="grid grid-cols-4 gap-2">
        <ModeButton
          label="Frio"
          tone="cool"
          active={
            modeDevice !== 3 &&
            modeAC === 0
          }
          onClick={
            selectCooling
          }
        >
          <SnowflakeIcon />
        </ModeButton>

        <ModeButton
          label="Quente"
          tone="heat"
          active={
            modeDevice !== 3 &&
            modeAC === 1
          }
          onClick={
            selectHeating
          }
        >
          <SunIcon />
        </ModeButton>

        <ModeButton
          label="Ventilar"
          tone="fan"
          active={
            modeDevice !== 3 &&
            modeAC === 3
          }
          onClick={
            selectFan
          }
        >
          <FanIcon />
        </ModeButton>

        <ModeButton
          label="Eco"
          tone="eco"
          active={
            modeDevice === 3
          }
          onClick={
            selectEco
          }
        >
          <LeafIcon />
        </ModeButton>
      </div>
    </div>
  );
}

function ModeButton({
  label,
  tone,
  active,
  children,
  onClick,
}: {
  label: string;
  tone: ModeTone;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const styles = {
    cool: {
      active:
        "border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.25)]",
      inactive:
        "border-blue-100 bg-blue-50/35 text-blue-700 hover:border-blue-200 hover:bg-blue-50",
      icon:
        "bg-blue-100/70 text-blue-600",
    },

    heat: {
      active:
        "border-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_8px_22px_rgba(234,88,12,0.22)]",
      inactive:
        "border-orange-100 bg-orange-50/30 text-orange-700 hover:border-orange-200 hover:bg-orange-50",
      icon:
        "bg-orange-100/70 text-orange-600",
    },

    fan: {
      active:
        "border-cyan-500 bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-[0_8px_22px_rgba(8,145,178,0.22)]",
      inactive:
        "border-cyan-100 bg-cyan-50/30 text-cyan-700 hover:border-cyan-200 hover:bg-cyan-50",
      icon:
        "bg-cyan-100/70 text-cyan-600",
    },

    eco: {
      active:
        "border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_8px_22px_rgba(5,150,105,0.22)]",
      inactive:
        "border-emerald-100 bg-emerald-50/30 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50",
      icon:
        "bg-emerald-100/70 text-emerald-600",
    },
  };

  const current = styles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 py-3 text-[11px] font-bold transition duration-200 hover:-translate-y-0.5 ${
        active ? current.active : current.inactive
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
          active ? "bg-white/15 text-white" : current.icon
        }`}
      >
        <span className="h-5 w-5">
          {children}
        </span>
      </span>

      <span className="whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

function SnowflakeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path d="M12 2v20" />
      <path d="M4.2 6.5l15.6 11" />
      <path d="M19.8 6.5l-15.6 11" />

      <path d="m9.5 3.5 2.5 2 2.5-2" />
      <path d="m9.5 20.5 2.5-2 2.5 2" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.9 4.9l1.4 1.4" />
      <path d="M17.7 17.7l1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.9 19.1l1.4-1.4" />
      <path d="M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function FanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
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
  );
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path d="M20 4c-7 0-12 3-14 8-1 3 1 6 4 6 6 0 9-7 10-14Z" />

      <path d="M5 20c2-5 6-8 11-11" />
    </svg>
  );
}