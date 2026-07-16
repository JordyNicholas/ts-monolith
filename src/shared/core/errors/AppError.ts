export class AppError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = 'AppError';
  }
}
