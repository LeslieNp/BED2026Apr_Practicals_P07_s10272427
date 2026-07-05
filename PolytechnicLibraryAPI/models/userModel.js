const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get a user by username (used for login and checking duplicates)
async function getUserByUsername(username) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Users WHERE username = @username";
    const request = connection.request();
    request.input("username", username);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
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

// Create a new user (registration)
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Users (username, passwordHash, role)
      VALUES (@username, @passwordHash, @role);
      SELECT SCOPE_IDENTITY() AS user_id;
    `;
    const request = connection.request();
    request.input("username", userData.username);
    request.input("passwordHash", userData.passwordHash);
    request.input("role", userData.role);
    const result = await request.query(query);

    return {
      user_id: result.recordset[0].user_id,
      username: userData.username,
      role: userData.role,
    };
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
  getUserByUsername,
  createUser,
};