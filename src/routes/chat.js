import express from 'express';
import { chat } from '../services/ollama.js';
import { validateResponse } from '../utils/validator.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "message" field'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }

    // Call Ollama
    const aiResponse = await chat(message);

    // Validate response
    const validation = validateResponse(aiResponse);

    if (!validation.valid) {
      return res.status(500).json({
        success: false,
        error: validation.error,
        raw: validation.raw
      });
    }

    return res.json({
      success: true,
      data: validation.data
    });

  } catch (error) {
    console.error('Chat error:', error);

    // Handle Ollama connection errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Ollama is not running. Please start Ollama first.',
        hint: 'Run: ollama serve'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
