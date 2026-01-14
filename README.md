# Calculator App

A full-stack calculator application with React frontend and Node.js backend.

## Project Structure

```
calculator-app/
├── frontend/          # React (Vite) - Deploy to Vercel
├── backend/           # Express API - Deploy to Railway
└── README.md
```

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Deployment

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set Root Directory: `backend`
3. Railway auto-detects Node.js

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set Root Directory: `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` = Your Railway backend URL

## Environment Variables

### Backend
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `VITE_API_URL` - Backend API URL
