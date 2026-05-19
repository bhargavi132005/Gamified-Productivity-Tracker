# 🚀 LevelUp: Gamified Productivity Tracker

Turn your daily habits and tasks into an RPG! **LevelUp** is a full-stack MERN application that gamifies your productivity. Earn XP, maintain daily streaks, unlock achievement badges, and level up your real-life skills.

## ✨ Features

- **User Authentication**: Secure JWT-based login and registration.
- **Quest Log (Task Management)**: Create, edit, complete, and delete daily quests.
- **Gamification Engine**: 
  - Earn XP for completing tasks.
  - Level up dynamically as your XP grows.
  - Lose XP for leaving tasks unfinished.
- **Daily Streaks**: Login consecutive days to build your streak and stay motivated!
- **Achievement Vault**: Automatically unlock badges (e.g., *First Blood, Consistency, Quest Master*) based on your stats.
- **Progress Analytics**: Beautiful, interactive charts showing your 7-day quest activity.
- **Customization**: Upload a custom avatar and manage your hero's profile.
- **Sleek UI/UX**: Dark mode glass-morphism design with fluid animations (Framer Motion) and particle confetti!

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- Recharts (Analytics Data Visualization)
- Canvas Confetti (Celebration effects)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Auth
- Bcrypt.js (Password Hashing)

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your local machine.
- A MongoDB URI (Local or MongoDB Atlas).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/gamified-tracker.git
cd gamified-tracker
```

### 2. Backend Setup
```bash
cd gamified-tracker/backend
npm install
```
Create a `.env` file in the `backend` directory and add the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```
Start the server:
```bash
npm run dev
# or: node server.js
```

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend folder:
```bash
cd gamified-tracker/frontend
npm install
```
Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to start your journey!

---

## 🔮 Future Roadmap
- Global Leaderboards
- Boss Fights (Collaborative group tasks)
- In-game currency and reward shop
- Push Notifications / Reminders
