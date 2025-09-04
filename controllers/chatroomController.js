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
  const { room, option, userId } = req.body; 

  try {
    const poll = await Poll.findOne({ room });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (!poll.options.includes(option)) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    // Check if user already voted
    if (poll.voters.includes(userId)) {
      return res.status(400).json({ error: 'You have already voted in this poll' });
    }

    // Count the vote
    const currentVotes = poll.votes.get(option) || 0;
    poll.votes.set(option, currentVotes + 1);

    //  Record the voter
    poll.voters.push(userId);

    poll.markModified('votes'); // ensure mongoose saves map changes
    await poll.save();

    res.json({ success: true, poll });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
};

