const Joi = require("joi");

// Validation schema for books (used for POST/PUT)
const bookSchema = Joi.object({
  title: Joi.string().min(1).max(50).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 1 character long",
    "string.max": "Title cannot exceed 50 characters",
    "any.required": "Title is required",
  }),
  author: Joi.string().min(1).max(50).required().messages({
    "string.base": "Author must be a string",
    "string.empty": "Author cannot be empty",
    "string.min": "Author must be at least 1 character long",
    "string.max": "Author cannot exceed 50 characters",
    "any.required": "Author is required",
  }),
});

// Middleware to validate book data (for POST/PUT)
function validateBook(req, res, next) {
  const { error } = bookSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate book ID from URL parameters
function validateBookId(req, res, next) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid book ID. ID must be a positive number" });
  }

  next();
}

module.exports = {
  validateBook,
  validateBookId,
};