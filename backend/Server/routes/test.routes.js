const express = require("express");
const router = express.Router();
const { sendTestMail } = require("../controllers/mail.controller");

router.get("/send-test-mail", sendTestMail);

module.exports = router;
