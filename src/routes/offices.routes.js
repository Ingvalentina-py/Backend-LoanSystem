const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  listOffices,
  createOfficeWithAdmin,
} = require("../controllers/offices.controller");

const router = express.Router();

router.use(authRequired, requireRole("superadmin"));

router.get("/", listOffices);
router.post("/", createOfficeWithAdmin);

module.exports = router;
