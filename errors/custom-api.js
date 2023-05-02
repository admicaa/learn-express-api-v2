class CustomAPIError extends Error {
  constructor(message, statusCode = null, body = null) {
    super(message);
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (body) {
      this.body = body;
    }
  }
}

export default CustomAPIError;
