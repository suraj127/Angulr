const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
  },
  messageBody: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  contactList: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ContactList',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  delayInSeconds: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
