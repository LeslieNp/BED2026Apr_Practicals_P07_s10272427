const express = require("express");
const dotenv = require("dotenv");
const sql = require("mssql");

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

// ===== PUBLIC ROUTES (no login needed) =====
app.post("/register", authController.registerUser);
app.post("/login", authController.loginUser);

// ===== PROTECTED ROUTES (JWT required) =====
// Both members and librarians can view books
app.get("/books", verifyJWT, bookController.getAllBooks);

// Only librarians can update availability
app.put(
  "/books/:bookId/availability",
  verifyJWT,
  bookController.updateBookAvailability
);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});