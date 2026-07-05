const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  // 1. Extract token from Authorization header
  // Format expected: "Bearer <token>"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // 2. Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired token" });
    }

    // 3. Define which roles can access which endpoints
    const authorizedRoles = {
      "GET /books": ["member", "librarian"], // both roles can view books
      "PUT /books/[0-9]+/availability": ["librarian"], // only librarians update
    };

    const requestedEndpoint = `${req.method} ${req.url}`;
    const userRole = decoded.role;

    // 4. Check if this user's role is allowed on this endpoint
    const authorizedRole = Object.entries(authorizedRoles).find(
      ([endpoint, roles]) => {
        const regex = new RegExp(`^${endpoint}$`);
        return regex.test(requestedEndpoint) && roles.includes(userRole);
      }
    );

    if (!authorizedRole) {
      return res
        .status(403)
        .json({ message: "Forbidden: You don't have permission" });
    }

    // 5. Attach user info to request for use in controllers
    req.user = decoded;
    next(); // move on to the controller
  });
}

module.exports = verifyJWT;