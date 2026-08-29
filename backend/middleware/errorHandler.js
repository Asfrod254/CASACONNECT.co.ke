const { createError } = require("../utils/errors");

const notFound = (req, res, next) => {
  next(createError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.code === "23505" ? 409 : 500);
  const message = err.message || "Internal Server Error";

  const response = {
    success: false,
    status: statusCode,
    message,
  };

  if (process.env.NODE_ENV !== "production" && err.details) {
    response.details = err.details;
  }

  if (statusCode === 500) {
    response.error = "Something went wrong on the server.";
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
