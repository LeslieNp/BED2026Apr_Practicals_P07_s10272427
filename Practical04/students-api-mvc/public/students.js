// Get references to the HTML elements you'll interact with:
const studentsListDiv = document.getElementById("studentsList");
const fetchStudentsBtn = document.getElementById("fetchStudentsBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to fetch students from the API and display them
async function fetchStudents() {
  try {
    studentsListDiv.innerHTML = "Loading students...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/students`);

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

    const students = await response.json();

    studentsListDiv.innerHTML = "";
    if (students.length === 0) {
      studentsListDiv.innerHTML = "<p>No students found.</p>";
    } else {
      students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.classList.add("student-item");
        studentElement.setAttribute("data-student-id", student.student_id);
        studentElement.innerHTML = `
                    <h3>${student.name}</h3>
                    <p>Address: ${student.address || "N/A"}</p>
                    <p>ID: ${student.student_id}</p>
                    <button onclick="editStudent(${student.student_id})">Edit</button>
                    <button class="delete-btn" data-id="${student.student_id}">Delete</button>
                `;
        studentsListDiv.appendChild(studentElement);
      });
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    studentsListDiv.innerHTML = `<p style="color: red;">Failed to load students: ${error.message}</p>`;
  }
}

// Edit student - redirects to edit-student.html with the student ID
function editStudent(studentId) {
  window.location.href = `edit-student.html?id=${studentId}`;
}

// Delete student - sends DELETE request and removes from DOM
async function handleDeleteClick(event) {
  const studentId = event.target.getAttribute("data-id");

  if (!confirm(`Are you sure you want to delete student ID ${studentId}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      messageDiv.textContent = `Student ID ${studentId} deleted successfully!`;
      messageDiv.style.color = "green";
      const studentElement = document.querySelector(
        `[data-student-id="${studentId}"]`
      );
      if (studentElement) studentElement.remove();
    } else if (response.status === 404) {
      messageDiv.textContent = `Student not found.`;
      messageDiv.style.color = "red";
    } else {
      throw new Error(`Failed to delete. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    messageDiv.textContent = `Error: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Fetch students when the button is clicked
fetchStudentsBtn.addEventListener("click", fetchStudents);