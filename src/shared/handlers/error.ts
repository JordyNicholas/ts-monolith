export class ErrorHandler extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'Error'
    Error.captureStackTrace(this, this.constructor)
  }
}
