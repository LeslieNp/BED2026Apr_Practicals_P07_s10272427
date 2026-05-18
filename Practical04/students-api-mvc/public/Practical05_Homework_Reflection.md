# Practical 05 - Homework Reflection

## Task 2: Reflection and Review

### 1. Separation of Concerns

**Distinct responsibilities of Model, View, and Controller:**

In my final project structure, the three components have very different jobs:

- **Model** (`bookModel.js`, `studentModel.js`): Handles all direct interaction
  with the database. It contains the SQL queries (SELECT, INSERT, UPDATE, DELETE)
  and uses parameterized queries to safely send data to MSSQL. The Model knows
  nothing about HTTP requests or how the data will be displayed - it just deals
  with raw data operations.

- **View** (HTML/CSS/JS files in the `public/` folder): This is the user-facing
  frontend. It includes pages like `index.html`, `create.html`, and `edit.html`
  along with their corresponding JavaScript files that send fetch requests to
  the backend. The View is responsible for collecting user input through forms,
  displaying results in the browser, and providing buttons/links for navigation.
  It knows nothing about SQL or database structure.

- **Controller** (`bookController.js`, `studentController.js`): Acts as the
  middleman between View and Model. It receives HTTP requests from the frontend,
  parses request bodies and URL parameters, calls the appropriate Model functions
  to perform database operations, and sends back JSON responses with the right
  HTTP status codes.

**How a separate View simplifies the backend:**

Having the frontend as a separate layer means my backend API can focus purely on
data and business logic. The API doesn't need to know whether the request is
coming from a browser, mobile app, or Postman - it just receives requests and
sends JSON back. This also makes the backend reusable: if I wanted to build a
mobile app or a different web frontend later, I could reuse the same API
without changing any backend code.

---

### 2. Robustness and Security

**When did bug fixing become easier?**

Bug fixing became significantly easier in Practical 04 (after MVC refactoring
and adding validation). In Practical 03, every route handler had everything
mixed together - database connections, query logic, error handling, and response
formatting - all in one place. When something broke, I had to scroll through
long route handlers to find the issue.

After Practical 04, debugging became much cleaner because:
- If the issue was about SQL, I knew to look in the Model file
- If the issue was about request format or status codes, I checked the Controller
- If invalid data was getting through, I checked the validation middleware

Practical 05 added another layer of clarity because I could use the browser's
Network tab to see exactly what data the frontend was sending and what the API
was returning. This made it very easy to spot whether a bug was in the frontend
code or the backend code.

---

### 3. Challenges and Problem Solving

**Most challenging aspect across Practical 03, 04, and 05:**

The most challenging aspect was the refactoring in Practical 04. Splitting a
working single-file `app.js` into multiple folders and files seemed simple at
first, but it required understanding how each piece connected through imports
and exports. I struggled with getting the file paths right (`./` vs `../`),
making sure each file properly exported its functions, and remembering to
update the require statements after moving code around. At one point I also
accidentally pasted Books API code into my Students API `app.js`, which caused
the server to crash silently because it tried to import a controller that
didn't exist.

I solved these issues by working incrementally: refactoring one piece at a
time, testing after each change in Postman, and reading error messages
carefully to understand what was actually broken.

**How MVC + separate View helps when adding new features:**

If I needed to add a new "genre" field to books, the MVC structure makes the
change very organized:
1. Update the `Books` table in MSSQL to add a `genre` column
2. Update `bookModel.js` to include `genre` in SELECT, INSERT, and UPDATE queries
3. Add `genre` validation to `bookValidation.js`
4. Add a `genre` input field to `create.html` and `edit.html`
5. Update the create and edit JS files to send `genre` in the request body

Each change is isolated to one file/layer, which means I'm less likely to break
existing functionality. Compare this to Practical 03's structure, where I would
have had to find and modify SQL queries, validation logic, and response handling
all scattered within different route handlers - much more error-prone.

For user authentication, the MVC pattern would let me add a new `authModel.js`,
`authController.js`, and `authMiddleware.js` without touching any existing
books or students code. The frontend could just add a login page that calls
those new endpoints.

---

### 4. Experiential Learning

Hands-on coding made these concepts stick in a way that just reading about
them never could. For example, I had read about SQL injection before, but it
only really clicked when I saw `request.input("id", bookId)` working in my
Model file - I could actually see how the SQL command and the data were being
sent as two separate things.

The same goes for MVC: reading "separation of concerns" sounded abstract, but
actually moving database code from a route handler into a Model file, then
seeing how short and readable my `app.js` became as a result, made the benefit
obvious. Watching Joi validation block bad requests with clear error messages
also helped me understand why validation matters more than just preventing
errors - it's about giving users helpful feedback.

The Practical 05 frontend work was especially valuable because it forced me
to think about both sides of the API. When my fetch request didn't work, I
had to use the browser console AND check the server's terminal output to
figure out where things went wrong - which deepened my understanding of how
client-server communication actually flows.