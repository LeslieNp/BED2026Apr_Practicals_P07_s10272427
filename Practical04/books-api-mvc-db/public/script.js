// Get references to the HTML elements you'll interact with:
const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to fetch books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = "Loading books...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/books`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    const books = await response.json();

    booksListDiv.innerHTML = "";
    if (books.length === 0) {
      booksListDiv.innerHTML = "<p>No books found.</p>";
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ID: ${book.id}</p>
                    <button onclick="viewBookDetails(${book.id})">View Details</button>
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                `;
        booksListDiv.appendChild(bookElement);
      });
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`;
  }
}

// View book details - redirects to view.html with the book ID
function viewBookDetails(bookId) {
  window.location.href = `view.html?id=${bookId}`;
}

// Edit book - redirects to edit.html with the book ID
function editBook(bookId) {
  window.location.href = `edit.html?id=${bookId}`;
}

// Delete book - sends DELETE request and removes from DOM
async function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");

  if (!confirm(`Are you sure you want to delete book ID ${bookId}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      messageDiv.textContent = `Book ID ${bookId} deleted successfully!`;
      messageDiv.style.color = "green";
      const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
      if (bookElement) bookElement.remove();
    } else if (response.status === 404) {
      messageDiv.textContent = `Book not found.`;
      messageDiv.style.color = "red";
    } else {
      throw new Error(`Failed to delete. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    messageDiv.textContent = `Error: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Fetch books when the button is clicked
fetchBooksBtn.addEventListener("click", fetchBooks);

// Optionally, fetch books when the page loads
// window.addEventListener('load', fetchBooks);