import { config } from "dotenv";
import swaggerAutogen from "swagger-autogen";

config();

const docs = {
  info: {
    version: "1.0.0",
    title: "Country Currency & Exchange API",
    description:
      "A RESTful API that fetches country data from an external API, stores it in a database, and provides CRUD operations.",
  },
  basePath: "/",
  schemes: ["https"],
  host: process.env.HOST,
  tags: [
    { name: "Home" },
    { name: "Countries", description: "Country Management Endpoints" },
  ],
};

const generateDocs = swaggerAutogen();
generateDocs("./swagger.json", ["./app.js"], docs);
