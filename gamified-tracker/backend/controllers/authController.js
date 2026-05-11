import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ username, email, password, lastLogin: new Date(), streak: 1 });
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
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
      now.setHours(0, 0, 0, 0);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((now - last) / 86400000); // 86400000 ms in a day

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
      streak: user.streak,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};