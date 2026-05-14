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
  task.title = req.body.title || task.title;
  const updatedTask = await task.save();

  // Gamification Logic: Add/Remove XP based on status change
  if (task.isCompleted !== wasCompleted) {
    const user = await User.findById(req.user._id);
    const xpModifier = task.type === 'daily' ? 10 : 5;
    
    if (task.isCompleted) {
      user.xp += xpModifier;
      // Level up logic
      const maxXP = user.level * 50;
      if (user.xp >= maxXP) {
        user.level += 1;
        user.xp -= maxXP;
      }
    } else {
      user.xp -= xpModifier;
      // Level down logic
      if (user.xp < 0) {
        if (user.level > 1) {
          user.level -= 1;
          user.xp += user.level * 50;
        } else {
          user.xp = 0;
        }
      }
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