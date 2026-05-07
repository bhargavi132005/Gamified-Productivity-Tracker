import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'daily',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  streak: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);