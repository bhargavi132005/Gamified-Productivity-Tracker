import Task from '../models/Task.js';
import User from '../models/User.js';

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
};

export const createTask = async (req, res) => {
  const { title, type } = req.body;
  const task = await Task.create({
    user: req.user._id,
    title,
    type
  });
  res.status(201).json(task);
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  
  if (!task || task.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Task not found or unauthorized' });
  }

  const wasCompleted = task.isCompleted;
  task.isCompleted = req.body.isCompleted ?? task.isCompleted;
  const updatedTask = await task.save();

  // Gamification Logic: Add XP if task wasn't completed before but is now
  if (task.isCompleted && !wasCompleted) {
    const user = await User.findById(req.user._id);
    const xpToAdd = task.type === 'daily' ? 10 : 5;
    
    user.xp += xpToAdd;
    
    // Level up logic
    const maxXP = user.level * 50;
    if (user.xp >= maxXP) {
      user.level += 1;
      user.xp -= maxXP;
    }
    await user.save();
  }

  res.json(updatedTask);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Task not found or unauthorized' });
  }
  await task.deleteOne();
  res.json({ message: 'Task removed' });
};