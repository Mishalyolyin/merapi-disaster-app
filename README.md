# Merapi Disaster Monitoring System

Real-time monitoring system for Mount Merapi's volcanic activity and disaster management.

## Features

- Real-time monitoring of volcanic activity
- Disaster management and reporting
- Evacuation point management
- User and admin dashboards
- Real-time weather updates
- Activity logging

## Tech Stack

- Frontend: React, Vite, TailwindCSS
- State Management: Redux Toolkit
- Real-time Updates: Socket.IO
- Backend: Node.js, Express
- Database: JSON Server (Development)

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/merapi-disaster-app.git
cd merapi-disaster-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example environment file
cp .env.example .env.development
cp .env.example .env.production
```

4. Update the environment variables in `.env.development` and `.env.production` with your values.

## Development

1. Start the development server:
```bash
npm run dev
```

2. Start the API server:
```bash
npm run api
```

3. Start the WebSocket server:
```bash
npm run server
```

Or run all services concurrently:
```bash
npm start
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start:prod
```

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set up environment variables in Vercel dashboard:
- Go to Project Settings
- Environment Variables
- Add variables from `.env.production`

## Environment Variables

Key environment variables needed:

```env
VITE_API_URL=           # API Base URL
VITE_WEBSOCKET_URL=     # WebSocket Server URL
NODE_ENV=               # development/production
PORT=                   # Server Port
ALLOWED_ORIGINS=        # Allowed CORS Origins
DB_HOST=               # Database Host
DB_PORT=               # Database Port
DB_NAME=               # Database Name
JWT_SECRET=            # JWT Secret Key
APP_NAME=              # Application Name
APP_URL=               # Application URL
```

## License

MIT