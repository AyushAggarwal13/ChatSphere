const Chat = require('../models/Chat');

exports.createPrivateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await Chat.findOne({ isGroupChat: false, users: { $all: [req.user._id, userId] } });
    if (!chat) chat = await Chat.create({ users: [req.user._id, userId] });
    res.json(await chat.populate('users', '-password'));
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, users } = req.body;
    const chat = await Chat.create({ chatName: name, isGroupChat: true, users, groupAdmin: req.user._id });
    res.json(await chat.populate('users', '-password'));
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id }).populate('users', '-password').sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};
