require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const model = require("./models/index");
const userRoute = require("./routes/userRoute");
const authToken = require("./middleware/auth");
const app = express();

// Using Morgan for logging
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(authToken);

// Define routes
app.use("/user", userRoute);

// Error handling for non-existent routes
app.use((req, res, next) => {
  const err = new Error(`${req.url} not found in this server`);
  err.status = 404;
  next(err);
});

// Generic error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// Export app for use in other files or testing
module.exports = app;
