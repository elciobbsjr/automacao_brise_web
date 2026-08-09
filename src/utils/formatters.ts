export function formatTemperature(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} °C`;
}

export function formatPercentage(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatConsumption(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR")} kWh`;
}

export function formatBtu(value?: number) {
  if (value === undefined) {
    return "Indisponível";
  }

  return `${value.toLocaleString("pt-BR")} BTU`;
}