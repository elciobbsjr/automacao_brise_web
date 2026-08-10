import type { DeviceParameters } from "@/types/device-control";

export async function updateDeviceParameters(
  deviceId: number,
  parameters: DeviceParameters,
) {
  const response = await fetch(
    `/api/brise/devices/${deviceId}/parameters`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Não foi possível enviar o comando ao dispositivo.",
    );
  }

  return result;
}

export async function getDeviceParameters(
  deviceId: number,
): Promise<DeviceParameters | null> {
  const response = await fetch(
    `/api/brise/devices/${deviceId}/details`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (
    data.parameters?.success !== true ||
    !data.parameters.data
  ) {
    return null;
  }

  return data.parameters.data as DeviceParameters;
}

export async function waitForDeviceConfirmation(
  deviceId: number,
  expected: DeviceParameters,
): Promise<boolean> {
  const attempts = 6;

  for (let attempt = 0; attempt < attempts; attempt++) {
    await delay(attempt === 0 ? 1000 : 2000);

    const current =
      await getDeviceParameters(deviceId);

    if (
      current &&
      parametersMatch(current, expected)
    ) {
      return true;
    }
  }

  return false;
}

function parametersMatch(
  current: DeviceParameters,
  expected: DeviceParameters,
) {
  return (
    current.modeDevice === expected.modeDevice &&
    current.modeAC === expected.modeAC &&
    current.fanSpeed === expected.fanSpeed &&
    current.setpointCool === expected.setpointCool &&
    current.setpointHeat === expected.setpointHeat &&
    current.ecoCool === expected.ecoCool &&
    current.ecoHeat === expected.ecoHeat
  );
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}