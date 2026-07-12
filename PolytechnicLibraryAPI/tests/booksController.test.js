const booksController = require("../controllers/bookController");
const Book = require("../models/bookModel");

// Mock the Book model - Jest will replace all its functions with fake versions
jest.mock("../models/bookModel");

describe("booksController.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should fetch all books and return a JSON response", async () => {
    const mockBooks = [
      { book_id: 1, title: "The Lord of the Rings", author: "Tolkien", availability: "Y" },
      { book_id: 2, title: "Dune", author: "Herbert", availability: "N" },
    ];

    // Tell the mock what to return when getAllBooks is called
    Book.getAllBooks.mockResolvedValue(mockBooks);

    // Create fake req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller function
    await booksController.getAllBooks(req, res);

    // Assertions - what should have happened
    expect(Book.getAllBooks).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBooks);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    // Simulate database error
    Book.getAllBooks.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await booksController.getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error retrieving books" });
  });
});

describe("booksController.updateBookAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update book availability and return the updated book", async () => {
    const mockUpdatedBook = {
      book_id: 1,
      title: "The Lord of the Rings",
      author: "Tolkien",
      availability: "N",
    };

    Book.updateBookAvailability.mockResolvedValue(mockUpdatedBook);

    const req = {
      params: { bookId: "1" },
      body: { availability: "N" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await booksController.updateBookAvailability(req, res);

    expect(Book.updateBookAvailability).toHaveBeenCalledWith(1, "N");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book availability updated successfully",
      book: mockUpdatedBook,
    });
  });

  it("should return 400 for invalid availability value", async () => {
    const req = {
      params: { bookId: "1" },
      body: { availability: "X" }, // Invalid - must be Y or N
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Availability must be 'Y' or 'N'",
    });
  });

  it("should return 404 if book not found", async () => {
    Book.updateBookAvailability.mockResolvedValue(null);

    const req = {
      params: { bookId: "999" },
      body: { availability: "Y" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
  });

  it("should return 500 on database error", async () => {
    Book.updateBookAvailability.mockRejectedValue(new Error("DB error"));

    const req = {
      params: { bookId: "1" },
      body: { availability: "Y" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error updating book availability",
    });
  });
});