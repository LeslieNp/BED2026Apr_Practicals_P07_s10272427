const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded());

// GET all students
app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .query("SELECT * FROM Students");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error retrieving students");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (closeError) { console.error("Error closing connection:", closeError); }
    }
  }
});

// GET student by ID
app.get("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) return res.status(400).send("Invalid student ID");

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(
      "SELECT * FROM Students WHERE student_id = @id"
    );
    if (!result.recordset[0]) return res.status(404).send("Student not found");
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error in GET /students/:id:", error);
    res.status(500).send("Error retrieving student");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (closeError) { console.error("Error closing connection:", closeError); }
    }
  }
});

// POST create new student
app.post("/students", async (req, res) => {
  const { name, address } = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("name", name);
    request.input("address", address);
    const result = await request.query(
      `INSERT INTO Students (name, address) VALUES (@name, @address); SELECT SCOPE_IDENTITY() AS id;`
    );

    const newStudentId = result.recordset[0].id;
    const getRequest = connection.request();
    getRequest.input("id", newStudentId);
    const newStudent = await getRequest.query(
      "SELECT * FROM Students WHERE student_id = @id"
    );

    res.status(201).json(newStudent.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (closeError) { console.error("Error closing connection:", closeError); }
    }
  }
});

// PUT update student by ID
app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name, address } = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", studentId);
    request.input("name", name);
    request.input("address", address);
    const result = await request.query(
      `UPDATE Students SET name = @name, address = @address WHERE student_id = @id`
    );

    if (result.rowsAffected[0] === 0) return res.status(404).send("Student not found");

    const getRequest = connection.request();
    getRequest.input("id", studentId);
    const updatedStudent = await getRequest.query(
      "SELECT * FROM Students WHERE student_id = @id"
    );

    res.json(updatedStudent.recordset[0]);
  } catch (error) {
    console.error("Error in PUT /students/:id:", error);
    res.status(500).send("Error updating student");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (closeError) { console.error("Error closing connection:", closeError); }
    }
  }
});

// DELETE student by ID
app.delete("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(
      "DELETE FROM Students WHERE student_id = @id"
    );

    if (result.rowsAffected[0] === 0) return res.status(404).send("Student not found");

    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /students/:id:", error);
    res.status(500).send("Error deleting student");
  } finally {
    if (connection) {
      try { await connection.close(); }
      catch (closeError) { console.error("Error closing connection:", closeError); }
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