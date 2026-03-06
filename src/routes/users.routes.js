const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  createCollector,
  listCollectors,
  setCollectorActive,
} = require("../controllers/users.controller");

const router = express.Router();

router.use(authRequired, requireRole("admin"));

router.post("/collectors", createCollector);
router.get("/collectors", listCollectors);
router.patch("/collectors/:id/active", setCollectorActive);

module.exports = router;
