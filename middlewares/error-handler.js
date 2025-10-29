import { CustomAPIError } from "../errors/index.js";
import { StatusCodes } from "http-status-codes";

export const ErrorHandler = (err, req, res, next) => {
  let { message } = err;

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((err) => err.message);
    message = errors.join(", ");

    if (!(err instanceof CustomAPIError)) statusCode = StatusCodes.BAD_REQUEST;
  }

  return res.status(statusCode).json({ status: "error", message });
};

export default ErrorHandler;
