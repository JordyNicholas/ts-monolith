import { AppError } from './AppError.js';

export class ResourceNotFoundError extends AppError {
  constructor(public readonly message = 'Resource not found') {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}
