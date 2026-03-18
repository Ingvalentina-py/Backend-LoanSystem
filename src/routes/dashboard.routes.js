const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get(
  "/",
  authRequired,
  requireRole("superadmin", "admin", "collector"),
  getDashboard,
);

module.exports = router;
