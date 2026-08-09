interface DeviceStatusBadgeProps {
  online: boolean;
  running: boolean;
}

export function DeviceStatusBadge({
  online,
  running,
}: DeviceStatusBadgeProps) {
  if (!online) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Sem resposta
      </span>
    );
  }

  if (running) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Ligado
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
      Desligado
    </span>
  );
}