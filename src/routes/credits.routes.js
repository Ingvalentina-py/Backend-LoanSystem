const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const {
  createCredit,
  listCredits,
  markCreditAsPaid,
} = require("../controllers/credits.controller");

const router = express.Router();

router.use(authRequired, requireRole("admin", "collector"));

router.post("/", createCredit);
router.get("/", listCredits);
router.patch("/:id/pay", markCreditAsPaid);

module.exports = router;
