interface PowerSelectorProps {
  enabled: boolean;

  onEnable: () => void;
  onDisable: () => void;
}

export function PowerSelector({
  enabled,
  onEnable,
  onDisable,
}: PowerSelectorProps) {
  return (
    <div className="rounded-2xl bg-slate-100/80 p-1.5">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={onEnable}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
            enabled
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "text-slate-500 hover:bg-white"
          }`}
        >
          <PowerIcon />

          Ligado
        </button>

        <button
          type="button"
          onClick={onDisable}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
            !enabled
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
              : "text-slate-500 hover:bg-white"
          }`}
        >
          <PowerIcon />

          Desligado
        </button>
      </div>
    </div>
  );
}

function PowerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M12 2v10" />
      <path d="M7.5 5.5a8 8 0 1 0 9 0" />
    </svg>
  );
}