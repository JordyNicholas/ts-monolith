import { AppError } from './AppError.js';

export class UnauthorizedError extends AppError {
  constructor(public readonly message = 'Unauthorised access.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
