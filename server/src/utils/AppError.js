// An error we throw on purpose, with an HTTP status and a message that is safe to show users.
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details; // optional: per-field messages, e.g. { email: '...' }
  }
}