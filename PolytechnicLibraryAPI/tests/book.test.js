const Book = require("../models/bookModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the entire mssql library

describe("Book.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all books from the database", async () => {
    const mockBooks = [
      {
        book_id: 1,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        availability: "Y",
      },
      {
        book_id: 2,
        title: "Dune",
        author: "Frank Herbert",
        availability: "N",
      },
    ];

    // Build the mock chain: sql.connect() → connection.request() → request.query()
    const mockRequest = {
      query: jest.fn().mockResolvedValue({ recordset: mockBooks }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const books = await Book.getAllBooks();

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(books).toHaveLength(2);
    expect(books[0].book_id).toBe(1);
    expect(books[0].title).toBe("The Lord of the Rings");
    expect(books[1].title).toBe("Dune");
  });

  it("should handle errors when retrieving books", async () => {
    sql.connect.mockRejectedValue(new Error("Database Error"));
    await expect(Book.getAllBooks()).rejects.toThrow("Database Error");
  });
});

describe("Book.updateBookAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the availability of a book and return the updated book", async () => {
    const mockUpdatedBook = {
      book_id: 1,
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      availability: "N",
    };

    // First query = UPDATE (returns rowsAffected)
    // Second query = SELECT (returns updated book)
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowsAffected: [1] })
        .mockResolvedValueOnce({ recordset: [mockUpdatedBook] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const result = await Book.updateBookAvailability(1, "N");

    expect(sql.connect).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith("id", 1);
    expect(mockRequest.input).toHaveBeenCalledWith("availability", "N");
    expect(result).toEqual(mockUpdatedBook);
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it("should return null if book with the given id does not exist", async () => {
    // UPDATE affects 0 rows
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const result = await Book.updateBookAvailability(999, "Y");

    expect(result).toBeNull();
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it("should throw an error if database operation fails", async () => {
    sql.connect.mockRejectedValue(new Error("Database Error"));
    await expect(Book.updateBookAvailability(1, "Y")).rejects.toThrow(
      "Database Error"
    );
  });
});