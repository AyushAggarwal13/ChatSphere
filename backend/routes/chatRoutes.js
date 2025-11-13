const express = require('express');
const auth = require('../middleware/authMiddleware');
const { createPrivateChat, createGroup, getUserChats } = require('../controllers/chatController');
const router = express.Router();

router.post('/private', auth, createPrivateChat);
router.post('/group', auth, createGroup);
router.get('/', auth, getUserChats);

module.exports = router;
