const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  createClient,
  listClients,
} = require("../controllers/clients.controller");

const router = express.Router();

router.use(authRequired, requireRole("admin", "collector"));

router.post("/", createClient);
router.get("/", listClients);

module.exports = router;
