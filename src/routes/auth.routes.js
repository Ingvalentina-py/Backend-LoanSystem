const express = require("express");
const { login, registerAdmin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/register-admin", registerAdmin);

module.exports = router;
