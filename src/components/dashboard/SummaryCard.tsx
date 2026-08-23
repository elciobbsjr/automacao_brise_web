interface SummaryCardProps {
  title: string;
  value: string;
  description: string;

  status:
    | "neutral"
    | "on"
    | "off"
    | "offline";
}

export function SummaryCard({
  title,
  value,
  description,
  status,
}: SummaryCardProps) {
  const statusStyles = {
    neutral: {
      dot: "bg-slate-400",
      badge:
        "bg-slate-100 text-slate-600",
    },

    on: {
      dot: "bg-emerald-500",
      badge:
        "bg-emerald-50 text-emerald-700",
    },

    off: {
      dot: "bg-slate-400",
      badge:
        "bg-slate-100 text-slate-600",
    },

    offline: {
      dot: "bg-amber-500",
      badge:
        "bg-amber-50 text-amber-700",
    },
  };

  const styles =
    statusStyles[status];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.badge}`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {description}
      </p>
    </article>
  );
}