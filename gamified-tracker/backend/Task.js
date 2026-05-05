import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Creates a reference to the User model
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['daily', 'habit'], // Can only be one of these values
      default: 'daily',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastCompleted: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;