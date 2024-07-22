const model = require("../models/index");
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { requestIncome } = require("../services/requestIncome");
const { requestExpenses } = require("../services/requestExpenses");
const controller = {};

// create new user
controller.createNew = async function (req, res) {
  try {
    //   check data has already been created
    const username = await model.user.findAll({
      where: { username: req.body.username },
    });

    const email = await model.user.findAll({
      where: { email: req.body.email },
    });

    if (username.length > 0) {
      return res.status(409).json({ message: "username has already in use" });
    }

    if (email.length > 0) {
      return res.status(409).json({ message: "email has already in use" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await model.user.create({
      username: req.body.username,
      email: req.body.email,
      username_aade: req.body.usernameAade,
      subscription_key_aade: req.body.subscriptionKey,
      password: hashedPassword,
      role: 1,
    });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "VbhxvsSEON",
      { expiresIn: "1000h" }
    );

    return res.status(201).json({
      message: "user created successfully!",
      data: {
        token: token,
        user: user,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// login function
controller.login = async function (req, res) {
  try {
    // Use findOne to get a single user

    const user = await model.user.findOne({
      where: {
        username: req.body.formData.username,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed!" });
    }

    // Corrected bcrypt.compare to compare password from request and user's stored hashed password
    const passwordMatch = await bcrypt.compare(
      req.body.formData.password,
      user.password
    ); // assuming the password field is named 'password'
    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed!" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      "VbhxvsSEON",
      { expiresIn: "1000h" }
    );
    return res.status(200).json({
      message: "authenticated user",
      data: { user: user, token: token },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// request income
controller.requestIncome = async function (req, res) {
  try {
    // Use findOne to get a single user

    const income = await requestIncome(req.params.id);
    return res.status(200).json({ message: "success", data: income });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// request expenses
controller.requestExpenses = async function (req, res) {
  try {
    // Use findOne to get a single user

    const expenses = await requestExpenses(req.params.id);
    return res.status(200).json({ message: "success", data: expenses });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

module.exports = controller;
