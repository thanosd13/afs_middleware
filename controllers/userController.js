const model = require("../models/index");
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  requestIncome,
  requestIncomeWithDates,
} = require("../services/requestIncome");
const {
  requestExpenses,
  requestExpensesWithDates,
} = require("../services/requestExpenses");
const sendEmail = require("../services/emailService");
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
      afm: req.body.afm,
      username_aade: req.body.usernameAade,
      subscription_key_aade: req.body.subscriptionKey,
      password: hashedPassword,
      role: 1,
    });

    try {
      await sendEmail(
        "adimopoulos@ceid.upatras.gr",
        "Εγγραφή χρήστη",
        `Πραγματοποίηθηκε εγγραφή με Όνομα χρήστη: <b>${req.body.username}</b> και ΑΦΜ: <b>${req.body.afm}</b>.`
      );
    } catch (error) {
      return res.status(500).json({ message: "E-mail could not be sent!" });
    }

    // const token = jwt.sign(
    //   { id: user.id, username: user.username },
    //   "VbhxvsSEON",
    //   { expiresIn: "1000h" }
    // );

    return res.status(201).json({
      message: "user created successfully!",
      data: {
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

    // Check if the user's role is pending
    if (user.role === "pending") {
      return res.status(403).json({ message: "Account pending approval" });
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

// request user data
controller.getUserData = async function (req, res) {
  try {
    const user = await model.user.findOne({
      where: { id: req.params.id },
    });
    return res.status(200).json({ message: "success", data: user });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// get users
controller.fetchUsers = async function (req, res) {
  try {
    const users = await model.user.findAll();
    return res.status(200).json({ message: "success", data: users });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

//update user data
controller.updateUser = async function (req, res) {
  try {
    const userId = req.params.id;
    const { username, email, username_aade, subscription_key_aade } = req.body;

    // Check if the user exists
    const user = await model.user.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new username or email is already in use
    if (username) {
      const existingUsername = await model.user.findOne({
        where: { username, id: { [sequelize.Op.ne]: userId } },
      });

      if (existingUsername) {
        return res.status(409).json({ message: "Username already in use" });
      }
    }

    if (email) {
      const existingEmail = await model.user.findOne({
        where: { email, id: { [sequelize.Op.ne]: userId } },
      });

      if (existingEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    // Update user details
    user.username = username || user.username;
    user.email = email || user.email;
    user.username_aade = username_aade || user.username_aade;
    user.subscription_key_aade =
      subscription_key_aade || user.subscription_key_aade;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully!",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// approve user
controller.approveUser = async function (req, res) {
  try {
    const userId = req.params.id; // Assume the user's ID is passed as a URL parameter

    // Check if the user exists and their role is "pending"
    const user = await model.user.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "pending") {
      return res.status(400).json({ message: "User is not pending approval" });
    }

    // Update the user's role to "user"
    user.role = "user";
    await user.save();

    try {
      await sendEmail(
        user.email,
        "Επιβεβαίωση χρήστη",
        `Η εγγραφή σας ολοκληρώθηκε με επιτυχία από το διαχειριστή του συστήματος. Πλέον, μπορείτε να χρησιμοποιείτε την εφαρμογή μας.</b>.`
      );
    } catch (error) {
      return res.status(500).json({ message: "E-mail could not be sent!" });
    }

    return res.status(200).json({
      message: "User approved successfully!",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// update user
controller.editUser = async function (req, res) {
  try {
    const userId = req.params.id;
    const { username, email, afm, username_aade, subscription_key_aade, role } =
      req.body;

    const user = await model.user.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.afm = afm || user.afm;
    user.username_aade = username_aade || user.username_aade;
    user.subscription_key_aade =
      subscription_key_aade || user.subscription_key_aade;
    user.role = role || user.role;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully!",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// delete user
controller.deleteUser = async function (req, res) {
  try {
    const userId = req.params.id;

    const user = await model.user.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
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

// request income with dates
controller.requestIncomeWithDates = async function (req, res) {
  try {
    // Use findOne to get a single user
    const income = await requestIncomeWithDates(
      req.params.id,
      req.body.dateFrom,
      req.body.dateTo
    );
    return res.status(200).json({ message: "success", data: income });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// request expenses with dates
controller.requestExpensesWithDates = async function (req, res) {
  try {
    // Use findOne to get a single user
    const expenses = await requestExpensesWithDates(
      req.params.id,
      req.body.dateFrom,
      req.body.dateTo
    );
    return res.status(200).json({ message: "success", data: expenses });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

// send email
controller.sendEmail = async function (req, res) {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // send email
    await sendEmail(email, subject, message);

    return res.status(200).json({ message: "e-mail has sent!" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error occurred" });
  }
};

module.exports = controller;
