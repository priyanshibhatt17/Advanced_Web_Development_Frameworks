const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required']
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// Pre-save hook to automatically trim whitespace from the title
taskSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.title = this.title.trim();
  }
});
module.exports = mongoose.model('Task', taskSchema);
