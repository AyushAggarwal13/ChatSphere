const express = require('express');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { sendMessage, getMessages, uploadFile } = require('../controllers/messageController');
const router = express.Router();

router.post('/', auth, sendMessage);
router.get('/:chatId', auth, getMessages);
// simple file upload (stores in /backend/uploads)
router.post('/upload', auth, upload.single('file'), uploadFile);

module.exports = router;
