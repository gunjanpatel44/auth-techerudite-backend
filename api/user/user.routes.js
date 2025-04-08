const router = require("express").Router();
const userController = require("./user.controller");

/* User signup */
router.post("/signup", userController.registerUser);

/* Customer Login */
router.post("/login-customer", userController.loginCustomer);

/* Admin Login */
router.post("/login-admin", userController.loginAdmin);

/* Verify User*/
router.put("/verify", userController.verifyUser);

/* Get User By Id */
router.get("/:id", userController.getUserFromId);

module.exports = router;
