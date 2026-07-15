import { AppError } from './AppError.js';

export class ResourceNotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
