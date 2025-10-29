import { StatusCodes } from "http-status-codes";

export const ErrorHandler = (err, req, res, next) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ error: "Internal server error" });
};

export default ErrorHandler;
