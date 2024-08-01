const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
router.post("/register", controller.user.createNew);
router.post("/login", controller.user.login);
router.post("/sendEmail", controller.user.sendEmail);
router.get("/getUserData/:id", controller.user.getUserData);
router.get("/requestIncome/:id", controller.user.requestIncome);
router.get("/fetchUsers", controller.user.fetchUsers);
router.patch("/approveUser/:id", controller.user.approveUser);
router.patch("/editUser/:id", controller.user.editUser);
router.delete("/deleteUser/:id", controller.user.deleteUser);
router.post(
  "/requestIncomeWithDates/:id",
  controller.user.requestIncomeWithDates
);
router.get("/requestExpenses/:id", controller.user.requestExpenses);
router.post(
  "/requestExpensesWithDates/:id",
  controller.user.requestExpensesWithDates
);
router.put("/updateUserData/:id", controller.user.updateUser);
module.exports = router;
