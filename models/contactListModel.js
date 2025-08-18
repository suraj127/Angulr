const mongoose = require('mongoose');

const contactListSchema = new mongoose.Schema({
  listName: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const ContactList = mongoose.model('ContactList', contactListSchema);

module.exports = ContactList;
