// server.js
import jsonServer from 'json-server';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const app = server;
const httpServer = createServer(app);

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:5173", "http://localhost:3000"];

// Configure Socket.IO with security options
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  // Add production security configurations
  cookie: {
    name: "io",
    httpOnly: true,
    secure: NODE_ENV === 'production'
  }
});

// Initial weather data
let weatherStats = {
  temperature: 27,
  windSpeed: 12,
  humidity: 75,
  windDirection: "Tenggara"
};

// Weather update function with rate limiting
const updateWeather = (() => {
  let lastUpdate = Date.now();
  const minInterval = 1000; // Minimum 1 second between updates

  return () => {
    const now = Date.now();
    if (now - lastUpdate < minInterval) {
      return;
    }
    
    weatherStats = {
      temperature: parseFloat((weatherStats.temperature + (Math.random() * 0.6 - 0.3)).toFixed(1)),
      windSpeed: parseFloat((Math.max(0, weatherStats.windSpeed + (Math.random() * 4 - 2))).toFixed(1)),
      humidity: Math.min(100, Math.max(0, weatherStats.humidity + (Math.random() * 10 - 5))),
      windDirection: weatherStats.windDirection
    };
    
    io.emit('weather_update', weatherStats);
    lastUpdate = now;
  };
})();

// Security middleware
server.use((req, res, next) => {
  // Add security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  if (NODE_ENV === 'production') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100;

server.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, firstRequest: now });
  } else {
    const limit = rateLimit.get(ip);
    if (now - limit.firstRequest > RATE_LIMIT_WINDOW) {
      limit.count = 1;
      limit.firstRequest = now;
    } else if (limit.count > MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests' });
    } else {
      limit.count++;
    }
  }
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Socket.IO connection handling with error handling
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send initial weather data
  socket.emit('weather_update', weatherStats);

  // Handle weather data requests with rate limiting
  let lastWeatherRequest = 0;
  socket.on('request_weather', () => {
    const now = Date.now();
    if (now - lastWeatherRequest >= 1000) { // Rate limit: 1 request per second
      updateWeather();
      lastWeatherRequest = now;
    }
  });

  // Handle activities with validation
  socket.on('new_activity', (activity) => {
    try {
      if (!activity || !activity.message) {
        throw new Error('Invalid activity data');
      }

      const newActivity = {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
        id: Date.now()
      };

      const db = router.db;
      const activities = db.get('activities');
      activities.push(newActivity).write();
      io.emit('activity_update', newActivity);
    } catch (error) {
      console.error('Error saving activity:', error);
      socket.emit('error', { message: 'Failed to save activity' });
    }
  });

  // Handle disaster updates with validation
  const handleDisasterUpdate = (data) => {
    try {
      if (!data || !data.type || !data.location) {
        throw new Error('Invalid disaster update data');
      }

      const disasterUpdate = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        id: Date.now()
      };

      const db = router.db;
      const disasters = db.get('disasters').value() || [];
      db.get('disasters').push(disasterUpdate).write();
      
      // Broadcast the update to all connected clients
      io.emit('disaster_broadcast', disasterUpdate);

      // Log the successful update
      console.log('New disaster update processed:', disasterUpdate);

      // Send confirmation to the sending client
      socket.emit('disaster_update_confirmed', {
        success: true,
        message: 'Disaster update successfully processed',
        data: disasterUpdate
      });

    } catch (error) {
      console.error('Error handling disaster update:', error);
      socket.emit('error', { 
        message: 'Failed to process disaster update',
        details: error.message 
      });
    }
  };

  socket.on('disaster_update', handleDisasterUpdate);

  // Handle evacuation updates
  socket.on('evacuation_update', (data) => {
    try {
      if (!data || !data.location || !data.status) {
        throw new Error('Invalid evacuation update data');
      }

      const evacuationUpdate = {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };

      const db = router.db;
      const evacuations = db.get('evacuations').value() || [];
      db.get('evacuations').push(evacuationUpdate).write();

      // Broadcast the evacuation update
      io.emit('evacuation_broadcast', evacuationUpdate);
    } catch (error) {
      console.error('Error handling evacuation update:', error);
      socket.emit('error', { message: 'Failed to process evacuation update' });
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with error handling
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
});