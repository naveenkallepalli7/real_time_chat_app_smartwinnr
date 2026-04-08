const Room = require('../models/Room');
const Message = require('../models/Message');

// Create or fetch 1-on-1 chat
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  try {
    let isChat = await Room.find({
      isGroup: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    isChat = await Room.populate(isChat, {
      path: 'lastMessage.sender',
      select: 'username avatar email',
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        name: 'sender',
        isGroup: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Room.create(chatData);
      const FullChat = await Room.findOne({ _id: createdChat._id }).populate('participants', '-password');
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all chats for a user
exports.fetchChats = async (req, res) => {
  try {
    let results = await Room.find({ participants: { $elemMatch: { $eq: req.user._id } } })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    results = await Room.populate(results, {
      path: 'lastMessage.sender',
      select: 'username avatar email',
    });
    
    res.status(200).send(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Group Chat
exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: 'Please Fill all the fields' });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send('More than 2 users are required to form a group chat');
  }

  users.push(req.user);

  try {
    const groupChat = await Room.create({
      name: req.body.name,
      participants: users,
      isGroup: true,
    });

    const fullGroupChat = await Room.findOne({ _id: groupChat._id }).populate('participants', '-password');
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search all groups
exports.searchGroups = async (req, res) => {
  const keyword = req.query.search
    ? {
        name: { $regex: req.query.search, $options: 'i' },
      }
    : {};

  try {
    const groups = await Room.find({ ...keyword, isGroup: true })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).send(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  const { roomId } = req.body;

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isGroup) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    // Check if user is already a participant
    if (room.participants.some(p => p._id.toString() === req.user._id.toString())) {
        const fullRoom = await Room.findById(roomId).populate('participants', '-password').populate('lastMessage');
        return res.status(200).json(fullRoom);
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $push: { participants: req.user._id } },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('lastMessage');

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages for a room
exports.allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar email')
      .populate('room');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message via API (useful for file uploads, standard text could also be sent this way or via sockets)
exports.sendMessage = async (req, res) => {
  const { content, roomId } = req.body;
  let mediaUrl = '';
  
  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
  }

  if (!content && !mediaUrl) {
    return res.status(400).json({ message: 'Invalid data passed into request' });
  }

  var newMessage = {
    sender: req.user._id,
    text: content || '',
    room: roomId,
    mediaUrl: mediaUrl,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'username avatar');
    message = await message.populate('room');
    message = await message.populate({
      path: 'room.participants',
      select: 'username avatar email',
    });

    await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
