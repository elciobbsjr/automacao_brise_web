interface ACModeSelectorProps {
  modeDevice: number;
  modeAC: number;

  onChange: (
    modeDevice: number,
    modeAC: number,
  ) => void;
}

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
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Modo
      </p>

      <div className="grid grid-cols-4 gap-2">
        <ModeButton
          label="Frio"
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
  active,
  children,
  onClick,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-xs font-semibold transition ${
        active
          ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          : "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white"
      }`}
    >
      <span className="h-6 w-6">
        {children}
      </span>

      {label}
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
      className="h-full w-full"
    >
      <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5l-15.6 11" />
      <path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2" />
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
      className="h-full w-full"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
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
      className="h-full w-full"
    >
      <circle
        cx="12"
        cy="12"
        r="2"
      />

      <path d="M12 10c-1-4 1-7 3-7 2.5 0 3.5 4-1 7M14 12c4-1 7 1 7 3 0 2.5-4 3.5-7-1M12 14c1 4-1 7-3 7-2.5 0-3.5-4 1-7M10 12c-4 1-7-1-7-3 0-2.5 4-3.5 7 1" />
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
      className="h-full w-full"
    >
      <path d="M20 4c-7 0-12 3-14 8-1 3 1 6 4 6 6 0 9-7 10-14Z" />
      <path d="M5 20c2-5 6-8 11-11" />
    </svg>
  );
}