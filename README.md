# AI-Powered Notes App

A full-stack notes application built with the MERN stack and enhanced with AI-powered note summarization using a local Ollama model. Users can create, edit, pin, search, and manage notes securely with JWT-based authentication.

## Overview

This project is a modern note-taking app designed for quick personal organization and AI-assisted productivity. It lets users:

- create and manage notes with rich text content
- attach multiple images to each note
- pin important notes to the top
- search notes by title, content, or tags
- generate concise AI summaries of long notes
- sign up and log in securely using JWT authentication

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB Atlas / local MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Ollama API integration for AI summaries

## Features

- Secure authentication and protected routes
- Create, update, delete, and pin notes
- Search across note titles, content, and tags
- Image upload support for notes
- AI-generated summaries for long notes
- Responsive dashboard UI
- Clean and modern design

## Project Structure

```text
notes-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
├── LICENSE
└── package.json
```

## Prerequisites

Before running the app, make sure you have:

- Node.js v18 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- Ollama installed locally for AI summaries
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-powered-notes-app.git
cd ai-powered-notes-app
```

### 2. Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

Then update `backend/.env`:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/notes-app
JWT_SECRET=change_this_to_a_secure_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:8000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
copy .env.example .env
```

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the frontend:

```bash
npm run dev
```

The app will run at:

```text
http://localhost:5173
```

### 4. AI summary setup with Ollama

This app generates note summaries using a local LLM.

Install Ollama and pull the model used by the app:

```bash
ollama pull qwen2.5-coder:7b
```

Then make sure Ollama is running locally on:

```text
http://localhost:11434
```

If Ollama is not running, the summary generation feature may fail.

## Environment Notes

- `MONGO_URI` should point to your MongoDB instance.
- `JWT_SECRET` should be a long random string.
- Frontend expects the backend on `http://localhost:8000`.
- The app uses a hardcoded frontend origin for CORS in the backend, which should match your dev frontend URL.

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Notes

```text
GET    /api/notes
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
PATCH  /api/notes/:id/pin
GET    /api/notes/search?q=keyword
POST   /api/notes/:id/summarize
```

## Screenshots

The app includes a clean dashboard with:
- note cards
- pinned notes section
- search bar
- create/edit modal
- AI summary support

## Usage

1. Register a new account or log in.
2. Create a note with a title and content.
3. Add tags or images if needed.
4. Pin important notes.
5. Use search to quickly find notes.
6. Generate an AI summary for long notes to get a concise overview.

## Notes

- This project is intended for local development and learning.
- For production deployment, use environment variables securely and configure a production MongoDB database.
- You may want to add a reverse proxy, HTTPS, and deployment-specific security review before publishing.

## Contributing

Contributions are welcome. If you want to improve the app, feel free to open an issue or submit a pull request.
