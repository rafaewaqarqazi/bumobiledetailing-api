import { HttpError, HttpResponse } from './httpError';

/**
 * Exception for 400 HTTP error.
 */
export class BadRequestError extends HttpError {
  name = 'BadRequestError';

  constructor(message?: string, errors?: any) {
    super(400);
    Object.setPrototypeOf(this, BadRequestError.prototype);

    if (errors) {
      this.response = new HttpResponse();
      this.response.errors = errors;
    }
    if (message) this.message = message;
  }
}
