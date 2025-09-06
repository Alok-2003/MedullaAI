const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({
  origin: ['http://localhost:5173', 'https://medulla-ai-test.vercel.app'],
  credentials: true,
})); // Enable CORS for specified origins

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/canvas', require('./routes/canvasRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Medulla AI Authentication API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server with Socket.IO
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  }
});

io.on('connection', (socket) => {
  socket.on('auth:join', (userId) => {
    if (userId) socket.join(String(userId));
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
