const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  room: String,
  question: String,
  options: [String],
  votes: {
    type: Map,
    of: Number
  }
});

module.exports = mongoose.model('Poll', PollSchema);
