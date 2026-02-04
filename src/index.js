import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import { checkConnection } from './services/ollama.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const ollamaStatus = await checkConnection();
  res.json({
    status: 'ok',
    ollama: ollamaStatus
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PlatformAI',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PlatformAI server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: POST http://localhost:${PORT}/api/chat`);
});
