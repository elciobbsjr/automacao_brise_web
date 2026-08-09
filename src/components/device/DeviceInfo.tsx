interface DeviceInfoProps {
  label: string;
  value: string;
}

export function DeviceInfo({
  label,
  value,
}: DeviceInfoProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}