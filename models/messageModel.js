const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Campaign',
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Contact',
    },
    status: {
      type: String,
      required: true,
      enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
      default: 'queued',
    },
    whatsappMessageId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
