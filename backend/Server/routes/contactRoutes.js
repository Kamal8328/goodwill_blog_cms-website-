const express = require("express");
const router = express.Router();
const { sendContactMail } = require("../controllers/mailController");

router.post("/contact", sendContactMail);

module.exports = router;
