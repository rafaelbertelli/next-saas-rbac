import { getAuthToken } from "@/app/auth/_backend/auth";
import ky, { type Options } from "ky";

class HttpClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpClientError";
  }
}

// Cliente base sem autenticação
const baseClient = ky.create({
  prefixUrl: "http://localhost:8080",
});

// Cliente com autenticação
const authenticatedClient = ky.create({
  prefixUrl: "http://localhost:8080",
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getAuthToken();
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
