export class InternalServerError extends Error {
  public statusCode = 500;

  constructor(message: string) {
    super(message);
  }
}
