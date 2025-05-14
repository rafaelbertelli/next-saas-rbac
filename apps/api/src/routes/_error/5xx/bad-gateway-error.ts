export class BadGatewayError extends Error {
  public statusCode = 502;

  constructor(message: string) {
    super(message);
  }
}
