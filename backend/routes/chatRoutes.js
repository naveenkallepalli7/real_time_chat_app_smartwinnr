const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  allMessages,
  sendMessage,
  searchGroups,
  joinGroup,
} = require('../controllers/chatController');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/groups/search').get(protect, searchGroups);
router.route('/groups/join').post(protect, joinGroup);
router.route('/:roomId/messages').get(protect, allMessages);
router.route('/messages').post(protect, upload.single('media'), sendMessage);

module.exports = router;
