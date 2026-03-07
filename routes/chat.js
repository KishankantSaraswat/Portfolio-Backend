const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');

// POST /api/chat
router.post('/', chatController.chatResponse);

module.exports = router;
