const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const bookController = require("./controllers/bookController");
const userController = require("./controllers/userController");
const {
  validateBook,
  validateBookId,
} = require("./middlewares/bookValidation");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// ===== Books Routes =====
app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById);
app.post("/books", validateBook, bookController.createBook);
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook);
app.delete("/books/:id", validateBookId, bookController.deleteBook);

// ===== Users Routes =====
// IMPORTANT: specific routes like /users/search and /users/with-books
// MUST come BEFORE the /users/:id route, otherwise Express will treat
// "search" or "with-books" as an ID and call getUserById instead.
app.get("/users/search", userController.searchUsers);
app.get("/users/with-books", userController.getUsersWithBooks);
app.get("/users", userController.getAllUsers);
app.get("/users/:id", userController.getUserById);
app.post("/users", userController.createUser);
app.put("/users/:id", userController.updateUser);
app.delete("/users/:id", userController.deleteUser);

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