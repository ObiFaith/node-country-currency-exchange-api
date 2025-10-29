import rateLimit from "express-rate-limit";

const rateLimiter = (
  maxRequests = 100,
  minutes = 15,
  message = "Too many requests from this IP, please try again later."
) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: maxRequests,
    message,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

export default rateLimiter;
