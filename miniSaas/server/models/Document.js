const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['invoice', 'quote'],
    required: true
  },
  number: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema); 