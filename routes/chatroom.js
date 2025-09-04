// routes/chatroom.js
const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroomController');

router.get('/categories', chatroomController.getCategories);
router.get('/messages/:room', chatroomController.getMessages);
router.get('/poll/:room', chatroomController.getPoll);
router.post('/vote', chatroomController.submitVote);
router.get('/categories/:category/rooms', chatroomController.getRoomsByCategory);

module.exports = router;


