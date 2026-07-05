const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// ===== REGISTER =====
async function registerUser(req, res) {
  const { username, password, role } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Username, password, and role are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  if (role !== "member" && role !== "librarian") {
    return res
      .status(400)
      .json({ message: "Role must be either 'member' or 'librarian'" });
  }

  try {
    // Check if username already exists
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in DB
    const newUser = await userModel.createUser({
      username,
      passwordHash,
      role,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ===== LOGIN =====
async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Find user by username
    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare given password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3600s",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  registerUser,
  loginUser,
};