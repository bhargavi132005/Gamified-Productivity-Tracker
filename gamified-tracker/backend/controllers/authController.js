import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ username, email, password, lastLogin: new Date(), streak: 1 });
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      avatar: user.avatar,
      streak: user.streak,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const now = new Date();
    if (user.lastLogin) {
      const last = new Date(user.lastLogin);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(last);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - lastDate) / 86400000); // 86400000 ms in a day

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      avatar: user.avatar,
      streak: user.streak,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    let streakUpdated = false;

    if (user.lastLogin) {
      const last = new Date(user.lastLogin);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(last);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.round((today - lastDate) / 86400000);

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
      // Always update lastLogin to keep it fresh for today
      user.lastLogin = now;
      streakUpdated = true;
    } else {
      user.streak = 1;
      user.lastLogin = now;
      streakUpdated = true;
    }

    if (streakUpdated) await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    if (req.body.password) {
      if (req.body.currentPassword && await bcrypt.compare(req.body.currentPassword, user.password)) {
        user.password = req.body.password;
      } else {
        return res.status(401).json({ message: 'Invalid current password' });
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      xp: updatedUser.xp,
      level: updatedUser.level,
      avatar: updatedUser.avatar,
      streak: updatedUser.streak,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};