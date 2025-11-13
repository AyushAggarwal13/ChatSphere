# ChatSphere Backend

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (nodemon)

The backend exposes:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout (protected)
- GET /api/chats (protected)
- POST /api/chats/private (protected)
- POST /api/chats/group (protected)
- POST /api/messages (protected)
- GET /api/messages/:chatId (protected)
- POST /api/messages/upload (protected)  -- accepts multipart/form-data 'file'
