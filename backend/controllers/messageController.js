const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId, attachments } = req.body;
    if (!chatId) return res.status(400).json({ message: 'ChatId required' });
    const message = await Message.create({ sender: req.user._id, content, chat: chatId, attachments });
    await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });
    res.json(await message.populate('sender', '-password').populate('chat'));
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).populate('sender', '-password').sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

// simple upload response expected by frontend
exports.uploadFile = async (req, res) => {
  try {
    // multer has placed file info in req.file
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // if using Cloudinary, you can upload here. For now we return local path or placeholder.
    // But if CLOUDINARY_URL is set, use cloudinary.uploader.upload_stream in production.
    res.json({ url: `/uploads/${req.file.filename}`, mimetype: req.file.mimetype });
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};
