const path = require("path");

const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const bookController = require("./controllers/bookController");
const {
  validateBook,
  validateBookId,
} = require("./middlewares/bookValidation");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById);
app.post("/books", validateBook, bookController.createBook);
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook);
app.delete("/books/:id", validateBookId, bookController.deleteBook);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});