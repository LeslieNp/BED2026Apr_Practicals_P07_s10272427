const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded());

// GET all books
app.get("/books", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT id, title, author FROM Books`;
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /books:", error);
    res.status(500).send("Error retrieving books");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// GET book by ID
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const request = connection.request();
    request.input("id", bookId);
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /books/${bookId}:`, error);
    res.status(500).send("Error retrieving book");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// POST create new book
app.post("/books", async (req, res) => {
  const newBookData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;`;
    const request = connection.request();
    request.input("title", newBookData.title);
    request.input("author", newBookData.author);
    const result = await request.query(sqlQuery);

    const newBookId = result.recordset[0].id;

    const getNewBookQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const getNewBookRequest = connection.request();
    getNewBookRequest.input("id", newBookId);
    const newBookResult = await getNewBookRequest.query(getNewBookQuery);

    res.status(201).json(newBookResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /books:", error);
    res.status(500).send("Error creating book");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

app.listen(port, async () => {
  try {
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});

// PUT update book by ID
app.put("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  const { title, author } = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", bookId);
    request.input("title", title);
    request.input("author", author);

    const result = await request.query(
      `UPDATE Books SET title = @title, author = @author WHERE id = @id`
    );

    // Check if any row was actually updated
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Book not found");
    }

    // Fetch and return the updated book
    const getRequest = connection.request();
    getRequest.input("id", bookId);
    const updatedBook = await getRequest.query(
      `SELECT * FROM Books WHERE id = @id`
    );

    res.json(updatedBook.recordset[0]); // 200 OK by default
  } catch (error) {
    console.error("Error in PUT /books/:id:", error);
    res.status(500).send("Error updating book");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// DELETE book by ID
app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", bookId);

    const result = await request.query(
      `DELETE FROM Books WHERE id = @id`
    );

    // Check if any row was actually deleted
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Book not found");
    }

    res.status(204).send(); // 204 = success, no content to return
  } catch (error) {
    console.error("Error in DELETE /books/:id:", error);
    res.status(500).send("Error deleting book");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});