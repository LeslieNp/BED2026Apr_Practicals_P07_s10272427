const express = require("express");
const dotenv = require("dotenv");
const sql = require("mssql");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

// Load environment variables
dotenv.config();

// Import controllers
const authController = require("./controllers/authController");
const bookController = require("./controllers/bookController");

// Import middleware
const verifyJWT = require("./middlewares/authMiddleware");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI documentation - accessible at http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===== PUBLIC ROUTES (no login needed) =====
app.post("/register", authController.registerUser);
app.post("/login", authController.loginUser);

// ===== PROTECTED ROUTES (JWT required) =====
app.get("/books", verifyJWT, bookController.getAllBooks);
app.put(
  "/books/:bookId/availability",
  verifyJWT,
  bookController.updateBookAvailability
);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API documentation at http://localhost:${port}/api-docs`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});