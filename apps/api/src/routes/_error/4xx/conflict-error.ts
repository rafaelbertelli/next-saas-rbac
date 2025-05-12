export class ConflictError extends Error {
  public statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}
