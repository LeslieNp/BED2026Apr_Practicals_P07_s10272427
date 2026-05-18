const loadingMessageDiv = document.getElementById("loadingMessage");
const bookDetailDiv = document.getElementById("bookDetail");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to get book ID from URL query parameter (e.g., view.html?id=1)
function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Function to fetch and display a single book
async function fetchAndDisplayBook(bookId) {
  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    if (response.status === 404) {
      loadingMessageDiv.textContent = "Book not found.";
      return;
    }

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

    const book = await response.json();

    // Hide loading message, show book details
    loadingMessageDiv.style.display = "none";
    bookDetailDiv.style.display = "block";
    bookDetailDiv.innerHTML = `
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>ID:</strong> ${book.id}</p>
    `;
  } catch (error) {
    console.error("Error fetching book:", error);
    loadingMessageDiv.textContent = "";
    messageDiv.textContent = `Error: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Run on page load
const bookId = getBookIdFromUrl();
if (bookId) {
  fetchAndDisplayBook(bookId);
} else {
  loadingMessageDiv.textContent = "No book ID provided in URL.";
}