const userModel = require("../models/userModel");

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving users" });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving user" });
  }
}

// Create new user
async function createUser(req, res) {
  try {
    const newUser = await userModel.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
}

// Update user by ID
async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userModel.updateUser(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating user" });
  }
}

// Delete user by ID
async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await userModel.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
}

// Search users by username or email
async function searchUsers(req, res) {
  const searchTerm = req.query.searchTerm;
  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required" });
  }
  try {
    const users = await userModel.searchUsers(searchTerm);
    res.json(users);
  } catch (error) {
    console.error("Controller error in searchUsers:", error);
    res.status(500).json({ error: "Error searching users" });
  }
}

// Get all users with their books
async function getUsersWithBooks(req, res) {
  try {
    const users = await userModel.getUsersWithBooks();
    res.json(users);
  } catch (error) {
    console.error("Controller error in getUsersWithBooks:", error);
    res.status(500).json({ error: "Error fetching users with books" });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersWithBooks,
};