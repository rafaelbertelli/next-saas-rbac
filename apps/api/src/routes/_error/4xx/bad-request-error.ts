export class BadRequestError extends Error {
  public statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
