const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
router.post("/register", controller.user.createNew);
router.post("/login", controller.user.login);
router.get("/requestIncome/:id", controller.user.requestIncome);
router.get("/requestExpenses/:id", controller.user.requestExpenses);
module.exports = router;
