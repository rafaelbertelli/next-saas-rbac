import ky from "ky";

export const httpClient = ky.create({
  prefixUrl: "http://localhost:8080",
});
