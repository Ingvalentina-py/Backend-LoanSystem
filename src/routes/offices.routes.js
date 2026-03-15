const express = require("express");
const {
  listPublicOffices,
  createOffice,
} = require("../controllers/offices.controller");

const router = express.Router();

router.get("/public", listPublicOffices);
router.post("/", createOffice);

module.exports = router;
