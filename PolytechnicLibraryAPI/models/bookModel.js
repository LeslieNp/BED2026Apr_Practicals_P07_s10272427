const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all books
async function getAllBooks() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id AS book_id, title, author, availability FROM Books";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Update book availability (Y or N)
async function updateBookAvailability(bookId, availability) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "UPDATE Books SET availability = @availability WHERE id = @id";
    const request = connection.request();
    request.input("id", bookId);
    request.input("availability", availability);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    // Return the updated book
    const getRequest = connection.request();
    getRequest.input("id", bookId);
    const updated = await getRequest.query(
      "SELECT id AS book_id, title, author, availability FROM Books WHERE id = @id"
    );
    return updated.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllBooks,
  updateBookAvailability,
};