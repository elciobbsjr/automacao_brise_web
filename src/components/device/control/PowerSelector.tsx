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
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
          Estado
        </p>

        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              enabled
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          {enabled
            ? "Em operação"
            : "Desligado"}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={
              onEnable
            }
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition duration-200 ${
              enabled
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_6px_18px_rgba(5,150,105,0.22)]"
                : "text-slate-500 hover:bg-white hover:text-emerald-700"
            }`}
          >
            <PowerIcon />

            Ligado
          </button>

          <button
            type="button"
            onClick={
              onDisable
            }
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition duration-200 ${
              !enabled
                ? "bg-slate-900 text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)]"
                : "text-slate-500 hover:bg-white hover:text-slate-800"
            }`}
          >
            <PowerIcon />

            Desligado
          </button>
        </div>
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 2v10" />

      <path d="M7.5 5.5a8 8 0 1 0 9 0" />
    </svg>
  );
}