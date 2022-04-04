const express = require("express");
const router = express.Router();
const {
	getConversation,
	createConversation,
} = require("../controller/conversationController");

const { authWithToken } = require("../middleware/authMiddleware");

router
	.route("/")
	.get(authWithToken, getConversation)
	.post(authWithToken, createConversation);

module.exports = router;