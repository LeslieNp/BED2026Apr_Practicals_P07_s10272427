const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["./app.js"];

const doc = {
  info: {
    title: "Polytechnic Library API",
    description:
      "API for managing library books and users with role-based authentication",
    version: "1.0.0",
  },
  host: "localhost:3000",
  schemes: ["http"],
  tags: [
    { name: "Auth", description: "User registration and login" },
    { name: "Books", description: "Book management" },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter your JWT token like: Bearer <token>",
    },
  },
};

swaggerAutogen(outputFile, routes, doc);