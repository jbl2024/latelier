export const RestApiError = class RestApiError extends Error {
  constructor(message, statusCode = 422) {
    super(message);
    this.name = "RestApiError";
    this.statusCode = statusCode;
  }
};
