interface SummaryCardProps {
  title: string;
  value: string;
}

export function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </article>
  );
}