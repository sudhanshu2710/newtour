class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    // In Nodejs, It provides captureStackTrace method in Error object to get call stack information.
    //It creates .stack property with information to an target object.
    // It provides user defined function to capture the stack call trace.
  }
}

module.exports = AppError;
