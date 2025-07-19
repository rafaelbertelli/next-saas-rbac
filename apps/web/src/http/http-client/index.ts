import { env } from "@repo/env";
import ky, { type Options } from "ky";
import { getAuthToken } from "../../_backend/session/auth-token";

class HttpClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpClientError";
  }
}

// Cliente base sem autenticação
const baseClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
});

// Cliente com autenticação
const authenticatedClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getAuthToken();
        // https://app.rocketseat.com.br/classroom/front-end/group/desenvolvendo-o-front-end/lesson/obtendo-usuario-autenticado
        // 10:00
        if (!token) {
          throw new HttpClientError("Não autorizado: Token não encontrado");
        }
        request.headers.set("Authorization", `Bearer ${token}`);
      },
    ],
  },
});

interface HttpClientOptions extends Options {
  requireAuth?: boolean;
}

class HttpClient {
  private getClient(options?: HttpClientOptions) {
    // auth é padrão, precisa ser explícito para não usar
    return options?.requireAuth === false ? baseClient : authenticatedClient;
  }

  async get<T>(url: string, options?: HttpClientOptions): Promise<T> {
    const client = this.getClient(options);
    return client.get(url, options).json<T>();
  }

  async post<T>(url: string, options?: HttpClientOptions): Promise<T> {
    const client = this.getClient(options);
    return client.post(url, options).json<T>();
  }

  async put<T>(url: string, options?: HttpClientOptions): Promise<T> {
    const client = this.getClient(options);
    return client.put(url, options).json<T>();
  }

  async delete<T>(url: string, options?: HttpClientOptions): Promise<T> {
    const client = this.getClient(options);
    return client.delete(url, options).json<T>();
  }
}

export const httpClient = new HttpClient();
