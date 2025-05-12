export class UnauthorizedError extends Error {
  public statusCode = 401;

  constructor(message?: string) {
    super(message ?? "Unauthorized");
  }
}
