# Journal App

A simple journal application with React frontend and Node.js backend.

## Setup Instructions

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Frontend Dependencies
```bash
cd my-react-app
npm install
```

## Running the Application

### Start Backend Server (Terminal 1)
```bash
cd server
npm start
```
Server will run on http://localhost:3001

### Start Frontend (Terminal 2)
```bash
cd my-react-app
npm run dev
```
Frontend will run on http://localhost:5173

## Features
- Add journal entries with title and content
- View all entries with timestamps
- Delete entries
- Data persists in JSON file on server
- Simple REST API

## API Endpoints
- GET /api/entries - Get all entries
- POST /api/entries - Add new entry
- DELETE /api/entries/:id - Delete entry
