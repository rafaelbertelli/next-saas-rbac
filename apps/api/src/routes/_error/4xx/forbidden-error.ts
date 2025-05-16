export class ForbiddenError extends Error {
  public statusCode = 403;

  constructor(message: string = "Forbidden") {
    super(message);
  }
}
