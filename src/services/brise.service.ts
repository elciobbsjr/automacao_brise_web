import "server-only";

import {
  briseRequest,
} from "@/lib/brise-api";

import type {
  DashboardResponse,
} from "@/types/dashboard";

interface ApiDevice {
  deviceId: number;
}

interface DevicesResponse {
  devices: ApiDevice[];
}

type RequestResult =
  | {
      success: true;
      data: Record<string, unknown>;
    }
  | {
      success: false;
      error: string;
    };

interface CachedConfigResult {
  result: RequestResult;
  fromCache: boolean;
}

interface ConfigCacheEntry {
  data: Record<string, unknown>;
  expiresAt: number;
}

/*
 * Mantemos a concorrência já validada.
 *
 * Não vamos aumentar esse valor agora,
 * pois o limite ajuda a evitar sobrecarga
 * na API Brise.
 */
const CONCURRENCY_LIMIT = 4;

/*
 * Configurações do equipamento mudam
 * com pouca frequência.
 *
 * Durante 5 minutos reaproveitamos
 * configurações já consultadas.
 */
const CONFIG_CACHE_TTL =
  5 * 60_000;

/*
 * Cache em memória das configurações.
 *
 * A chave é o número do dispositivo.
 */
const configCache =
  new Map<
    number,
    ConfigCacheEntry
  >();

/*
 * Consulta genérica protegida.
 */
async function safelyRequest(
  endpoint: string,
): Promise<RequestResult> {
  try {
    const data =
      await briseRequest<
        Record<string, unknown>
      >(endpoint);

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao consultar a API Brise.",
    };
  }
}

/*
 * Remove informações que não devem
 * chegar ao dashboard.
 */
function sanitizeConfig(
  config: Record<
    string,
    unknown
  >,
): Record<string, unknown> {
  const {
    USRID,
    USRPASS,
    ...safeConfig
  } = config;

  void USRID;
  void USRPASS;

  return safeConfig;
}

/*
 * Faz uma consulta real à API Brise
 * e atualiza o cache do equipamento.
 */
async function fetchDeviceConfig(
  deviceId: number,
): Promise<RequestResult> {
  const config =
    await safelyRequest(
      `/device/${deviceId}/configs`,
    );

  if (!config.success) {
    return config;
  }

  const safeConfig =
    sanitizeConfig(
      config.data,
    );

  configCache.set(
    deviceId,
    {
      data: safeConfig,

      expiresAt:
        Date.now() +
        CONFIG_CACHE_TTL,
    },
  );

  return {
    success: true,
    data: safeConfig,
  };
}

/*
 * Retorna a configuração do cache
 * enquanto ela ainda for válida.
 *
 * Caso contrário, consulta novamente
 * a API Brise.
 */
async function getDeviceConfig(
  deviceId: number,
): Promise<CachedConfigResult> {
  const cached =
    configCache.get(
      deviceId,
    );

  if (
    cached &&
    cached.expiresAt >
      Date.now()
  ) {
    return {
      result: {
        success: true,
        data: cached.data,
      },

      fromCache: true,
    };
  }

  /*
   * Remove entradas expiradas.
   */
  if (cached) {
    configCache.delete(
      deviceId,
    );
  }

  const result =
    await fetchDeviceConfig(
      deviceId,
    );

  return {
    result,
    fromCache: false,
  };
}

/*
 * Obtém os dados necessários para
 * montar um equipamento no dashboard.
 */
async function getDeviceDetails(
  deviceId: number,
) {
  let [
    configResult,
    variables,
    parameters,
  ] = await Promise.all([
    getDeviceConfig(
      deviceId,
    ),

    safelyRequest(
      `/device/${deviceId}/variables`,
    ),

    safelyRequest(
      `/device/${deviceId}/parameters`,
    ),
  ]);

  /*
   * Caso variables e parameters falhem
   * simultaneamente, precisamos tomar
   * cuidado com uma configuração que
   * tenha vindo do cache.
   *
   * Uma configuração antiga não deve,
   * sozinha, fazer um equipamento
   * parecer online.
   *
   * Portanto, nesse caso fazemos uma
   * consulta real de /configs para
   * confirmar se ainda há comunicação.
   */
  if (
    !variables.success &&
    !parameters.success &&
    configResult.fromCache
  ) {
    configResult = {
      result:
        await fetchDeviceConfig(
          deviceId,
        ),

      fromCache: false,
    };
  }

  const config =
    configResult.result;

  return {
    deviceId,

    /*
     * Mantém a mesma ideia existente:
     * basta um dos endpoints responder
     * para considerarmos comunicação
     * com o equipamento.
     *
     * A diferença é que um config
     * simplesmente recuperado do cache
     * não é usado cegamente para isso.
     */
    online:
      config.success ||
      variables.success ||
      parameters.success,

    config:
      config.success
        ? config.data
        : null,

    variables:
      variables.success
        ? variables.data
        : null,

    parameters:
      parameters.success
        ? parameters.data
        : null,

    errors: {
      config:
        config.success
          ? null
          : config.error,

      variables:
        variables.success
          ? null
          : variables.error,

      parameters:
        parameters.success
          ? null
          : parameters.error,
    },
  };
}

/*
 * Executa o processamento de vários
 * equipamentos sem liberar todas as
 * requisições simultaneamente.
 */
async function processWithConcurrencyLimit<
  T,
  R,
>(
  items: T[],
  limit: number,
  worker: (
    item: T,
  ) => Promise<R>,
): Promise<R[]> {
  const results: R[] =
    new Array(items.length);

  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const currentIndex =
        nextIndex;

      if (
        currentIndex >=
        items.length
      ) {
        return;
      }

      nextIndex += 1;

      results[currentIndex] =
        await worker(
          items[
            currentIndex
          ],
        );
    }
  }

  const workerCount =
    Math.min(
      limit,
      items.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },

      () =>
        runWorker(),
    ),
  );

  return results;
}

export async function getDashboard(): Promise<DashboardResponse> {
  const data =
    await briseRequest<
      DevicesResponse
    >(
      "/user/devices",
    );

  if (
    !Array.isArray(
      data.devices,
    )
  ) {
    throw new Error(
      "A API Brise retornou uma lista de dispositivos inválida.",
    );
  }

  const devices =
    await processWithConcurrencyLimit(
      data.devices,
      CONCURRENCY_LIMIT,

      (device) =>
        getDeviceDetails(
          device.deviceId,
        ),
    );

  const online =
    devices.filter(
      (device) =>
        device.online,
    ).length;

  const offline =
    devices.length -
    online;

  return {
    total:
      devices.length,

    online,

    offline,

    devices,
  };
}