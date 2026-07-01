# 🔄 SkillSwap — Student Skill Exchange Platform

A full-stack MERN application where students can list skills they can teach, find peers, request skill swaps, chat in real time, schedule sessions, and share study materials.

## 🌐 Live Demo
[skill-exchange-jet-zeta.vercel.app](https://skill-exchange-jet-zeta.vercel.app)

## ✨ Features
- 🔐 JWT Authentication (Register/Login)
- 👤 Student Profiles with skills listing
- 🔍 Browse & Search students by skill
- 🤝 Send/Accept/Reject Swap Requests
- 💬 Real-time Chat (Socket.io)
- 📅 Session Scheduling with date & time
- 🎥 Google Meet Integration for live teaching
- 📎 Study Material Sharing (any file type)
- ⭐ Ratings & Reviews after swaps
- 📱 Fully Responsive UI (mobile + desktop)

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io |
| File Storage | Cloudinary |
| Deployment | Vercel (FE) + Render (BE) |

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📸 Screenshots
_Visit the live demo above to see the app in action!_

## 👨‍💻 Author
Vamshi — CSE (AI & ML) @ Sahyadri College of Engineering, Mangaluru
