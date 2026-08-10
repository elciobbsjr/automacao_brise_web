const BRISE_API_URL = process.env.BRISE_API_URL;
const BRISE_TOKEN = process.env.BRISE_TOKEN;

export class BriseApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BriseApiError";
    this.status = status;
  }
}

export async function briseRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BRISE_API_URL) {
    throw new Error(
      "A variável BRISE_API_URL não foi encontrada no arquivo .env.local.",
    );
  }

  if (!BRISE_TOKEN) {
    throw new Error(
      "A variável BRISE_TOKEN não foi encontrada no arquivo .env.local.",
    );
  }

  const response = await fetch(`${BRISE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${BRISE_TOKEN}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    throw new BriseApiError(
      "A API não retornou conteúdo. O dispositivo pode estar desligado ou a autenticação pode estar incorreta.",
      204,
    );
  }

  if (response.status === 401) {
    throw new BriseApiError(
      "O token da API Brise expirou ou foi revogado.",
      401,
    );
  }

  if (response.status === 403) {
    throw new BriseApiError(
      "A conta não possui acesso ao dispositivo.",
      403,
    );
  }

  if (!response.ok) {
    const body = await response.text();

    throw new BriseApiError(
      body || `Erro ao acessar a API Brise: ${response.status}.`,
      response.status,
    );
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BriseApiError(
      "A API Brise retornou uma resposta inválida.",
      502,
    );
  }
}