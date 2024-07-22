const db = require("../config/database");
const userModel = require("./userModel");
const model = {};

db.authenticate()
  .then(() =>
    console.log("Database connection has been established successfully.")
  )
  .catch((err) => console.error("Unable to connect to the database:", err));

db.sync()
  .then(() =>
    console.log(
      "User table has been successfully created or updated, if it does not exist or needs alteration"
    )
  )
  .catch((error) => console.error("This error occurred:", error));

model.user = userModel;
module.exports = model;
