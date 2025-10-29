import "express-async-error";

import fs from "fs";
import express from "express";
import {
  NotFound,
  rateLimiter,
  ErrorHandler,
  securityMiddleware,
} from "./middlewares/index.js";
import { configDotenv } from "dotenv";
import SwaggerUI from "swagger-ui-express";
import countryRoutes from "./routes/country.js";
import { getCountryStatus } from "./controllers/country.js";

configDotenv();

const app = express();
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger.json", "utf-8"));

// security middleware
securityMiddleware(app);
// swagger docs
app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));
// api rate limit
app.use("/api/v1", rateLimiter);
// routes
app.get("/", (_, res) =>
  /* #swagger.tags = ['Home'] */
  res.send(
    '<h1>Country Currency & Exchange API</h1><a href="/api-docs">Swagger Documentation</a>'
  )
);

app.get("/status", async (req, res) => {
  const total_countries = await prisma.country.count();
  const { last_refreshed_at } = await prisma.country.findFirst({
    select: { last_refreshed_at: true },
  });

  res.status(StatusCodes.OK).json({ total_countries, last_refreshed_at });
});
app.use("/countries", /* #swagger.tags = ['Countries'] */ countryRoutes);

// error handler
app.use(NotFound);
app.use(ErrorHandler);

// self-invoked function
(async () => {
  const port = process.env.PORT || 3000;
  try {
    app.listen(port, () => {
      console.log("Server running at port:", port);
    });
  } catch (error) {
    console.log("Error while running app:", error.message);
  }
})();
