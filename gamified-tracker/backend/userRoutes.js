import express from 'express';
import { registerUser, loginUser, getMe } from './userController.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
// The getMe route is protected by our middleware
router.get('/me', protect, getMe);

export default router;