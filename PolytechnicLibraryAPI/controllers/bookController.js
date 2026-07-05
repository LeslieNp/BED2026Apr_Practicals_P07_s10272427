const bookModel = require("../models/bookModel");

// Get all books (accessible to members and librarians)
async function getAllBooks(req, res) {
  try {
    const books = await bookModel.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ message: "Error retrieving books" });
  }
}

// Update book availability (librarians only)
async function updateBookAvailability(req, res) {
  const bookId = parseInt(req.params.bookId);
  const { availability } = req.body;

  // Validation
  if (isNaN(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  if (availability !== "Y" && availability !== "N") {
    return res
      .status(400)
      .json({ message: "Availability must be 'Y' or 'N'" });
  }

  try {
    const updatedBook = await bookModel.updateBookAvailability(
      bookId,
      availability
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book availability updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ message: "Error updating book availability" });
  }
}

module.exports = {
  getAllBooks,
  updateBookAvailability,
};