import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

type Cookies = ReturnType<typeof cookies>;
type CookieOptions = Partial<ResponseCookie>;

class CookiesApi {
  private readonly cookieStore: Cookies;

  constructor() {
    this.cookieStore = cookies();
  }

  async get(name: string) {
    return (await this.cookieStore).get(name)?.value;
  }

  async set(name: string, value: string, options: CookieOptions) {
    (await this.cookieStore).set(name, value, options);
  }

  async delete(name: string) {
    (await this.cookieStore).delete(name);
  }
}

export const cookiesApi = new CookiesApi();
