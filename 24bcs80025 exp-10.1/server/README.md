# Todo Server (Express + MongoDB)

## Setup
1. cd server
2. npm install
3. Set MONGO_URI in environment variables or use .env (example provided)
4. npm start

API endpoints:
- GET /api/todos
- POST /api/todos    { text }
- PUT /api/todos/:id { text?, completed? }
- DELETE /api/todos/:id
