// controllers/chatroomController.js
const Message = require('../models/message');
const Poll = require('../models/polls');
const categoryGroups = require('../data/category');

exports.getCategories = (req, res) => {
  res.json(Object.keys(categoryGroups));
};

exports.getRoomsByCategory = (req, res) => {
  const { category } = req.params;
  const rooms = categoryGroups[category];
  if (!rooms) return res.status(404).json({ error: 'Category not found' });
  res.json(rooms);
};

exports.getMessages = async (req, res) => {
  const { room } = req.params;
  const messages = await Message.find({ room });
  res.json(messages);
};

exports.getPoll = async (req, res) => {
  const { room } = req.params;
  let poll = await Poll.findOne({ room });

  if (!poll) {
    // You can dynamically generate options if you have a data source for nominees.
    // For now, we'll use static options.
    const options = ['Nominee A', 'Nominee B', 'Nominee C'];
    poll = new Poll({
      room,
      question: `Vote for the best in ${room}`,
      options,             
      votes: Object.fromEntries(options.map(o => [o, 0]))
    });
    await poll.save();
  }

  res.json(poll);
};


exports.submitVote = async (req, res) => {
  const { room, option } = req.body;

  try {
    const poll = await Poll.findOne({ room });

    if (poll && poll.options.includes(option)) {
      const currentVotes = poll.votes.get(option) || 0;
      poll.votes.set(option, currentVotes + 1);

      // Force Mongoose to detect the change
      poll.markModified('votes');
      await poll.save();

      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid vote' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
};
