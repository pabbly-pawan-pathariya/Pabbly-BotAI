import express from 'express';
import { chat } from '../services/ollama.js';
import { validateResponse } from '../utils/validator.js';

const VALID_MODES = ['QNA', 'WORKFLOW', 'TASK'];

const router = express.Router();

function sendJson(res, status, body) {
  try {
    return res.status(status).json(body);
  } catch (e) {
    console.error('sendJson failed:', e);
    return res.status(status).type('json').send(JSON.stringify(body));
  }
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing or invalid "message" field'
      });
    }

    if (message.trim().length === 0) {
      return sendJson(res, 400, {
        success: false,
        error: 'Message cannot be empty'
      });
    }

    // Call Ollama
    let aiResponse = await chat(message);

    // Handle empty or undefined response
    if (aiResponse == null || typeof aiResponse !== 'string') {
      aiResponse = '';
    }
    aiResponse = aiResponse.trim();

    // Fallback for empty response (e.g. model returned nothing for "hi")
    const isSimpleGreeting = /^(hi|hello|hey|hiya|yo)\s*!?$/i.test(message.trim());
    if (!aiResponse && isSimpleGreeting) {
      aiResponse = JSON.stringify({
        mode: 'QNA',
        data: {
          answer: 'Hello! I\'m Pabbly AI. Ask me about automations, workflows, or how to create campaigns.',
          related_features: ['automations', 'workflows', 'campaigns'],
          follow_up_suggestions: ['What is an automation?', 'Create onboarding workflow', 'Setup email campaign']
        }
      });
    }

    // Auto-detect mode from user message if needed
    function detectModeFromMessage(msg) {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('create') || lowerMsg.includes('build') || lowerMsg.includes('design') || 
          lowerMsg.includes('workflow') || lowerMsg.includes('automation')) {
        return 'WORKFLOW';
      }
      if (lowerMsg.includes('task') || lowerMsg.includes('setup') || lowerMsg.includes('perform')) {
        return 'TASK';
      }
      // Default to QNA for questions
      if (lowerMsg.includes('what') || lowerMsg.includes('how') || lowerMsg.includes('which') || 
          lowerMsg.includes('why') || lowerMsg.includes('when') || lowerMsg.includes('where') ||
          lowerMsg.includes('?') || lowerMsg.includes('explain') || lowerMsg.includes('tell me')) {
        return 'QNA';
      }
      return 'QNA'; // Default fallback
    }

    // Validate response
    let validation = validateResponse(aiResponse);

    // Auto-fix common issues with model responses
    if (!validation.valid && typeof validation.raw === 'object') {
      const parsed = validation.raw;
      
      // Fix: Invalid or missing mode
      let fixedMode = null;
      if (parsed.mode) {
        const modeUpper = String(parsed.mode).toUpperCase();
        // Try to match valid mode (handle typos like "qna", "QnA", "workflow", etc.)
        if (modeUpper.includes('QNA') || modeUpper === 'Q&A' || modeUpper === 'QA') {
          fixedMode = 'QNA';
        } else if (modeUpper.includes('WORKFLOW') || modeUpper.includes('AUTOMATION')) {
          fixedMode = 'WORKFLOW';
        } else if (modeUpper.includes('TASK') || modeUpper.includes('ACTION')) {
          fixedMode = 'TASK';
        } else if (VALID_MODES.includes(modeUpper)) {
          fixedMode = modeUpper;
        }
      }
      
      // If mode is still invalid, detect from message
      if (!fixedMode) {
        fixedMode = detectModeFromMessage(message);
        console.log(`Auto-detected mode "${fixedMode}" from message: "${message.substring(0, 50)}"`);
      }
      
      // Fix: Has mode but missing/invalid data object
      if (fixedMode && (!parsed.data || typeof parsed.data !== 'object')) {
        console.log(`Auto-fixing: Setting mode to "${fixedMode}" and creating data structure`);
        const fixed = {
          mode: fixedMode,
          data: parsed.data || {}
        };
        
        // For QNA mode, if answer exists elsewhere, move it
        if (fixedMode === 'QNA') {
          if (parsed.answer && typeof parsed.answer === 'string') {
            fixed.data.answer = parsed.answer;
          } else if (parsed.response && typeof parsed.response === 'string') {
            fixed.data.answer = parsed.response;
          } else if (parsed.text && typeof parsed.text === 'string') {
            fixed.data.answer = parsed.text;
          } else if (!fixed.data.answer) {
            // Use the original message context to generate a helpful answer
            fixed.data.answer = 'I understand your question. Let me help you with that.';
          }
          fixed.data.related_features = parsed.related_features || fixed.data.related_features || [];
          fixed.data.follow_up_suggestions = parsed.follow_up_suggestions || fixed.data.follow_up_suggestions || [];
        }
        
        const fixedValidation = validateResponse(JSON.stringify(fixed));
        if (fixedValidation.valid) {
          validation = fixedValidation;
        }
      } else if (fixedMode && parsed.mode !== fixedMode) {
        // Fix: Just update the mode
        console.log(`Auto-fixing: Correcting mode from "${parsed.mode}" to "${fixedMode}"`);
        parsed.mode = fixedMode;
        const fixedValidation = validateResponse(JSON.stringify(parsed));
        if (fixedValidation.valid) {
          validation = fixedValidation;
        }
      }
    }

    // If model returned plain text instead of JSON (e.g. "Hello!" for "hi"), treat as QNA answer
    if (!validation.valid && aiResponse.length > 0 && typeof validation.raw === 'string') {
      const detectedMode = detectModeFromMessage(message);
      const fallback = {
        mode: detectedMode,
        data: {
          answer: aiResponse.length <= 500 ? aiResponse : aiResponse.slice(0, 500) + '…',
          related_features: [],
          follow_up_suggestions: []
        }
      };
      const fallbackValidation = validateResponse(JSON.stringify(fallback));
      if (fallbackValidation.valid) {
        validation = fallbackValidation;
      }
    }
    
    // Final fallback: If still invalid, create QNA response from detected mode
    if (!validation.valid) {
      const detectedMode = detectModeFromMessage(message);
      console.log(`Final fallback: Creating ${detectedMode} response for message: "${message.substring(0, 50)}"`);
      const finalFallback = {
        mode: detectedMode,
        data: detectedMode === 'QNA' ? {
          answer: 'I apologize, but I encountered an issue processing your request. Could you please rephrase your question?',
          related_features: [],
          follow_up_suggestions: []
        } : {
          workflow_name: 'Untitled',
          description: '',
          nodes: [],
          edges: []
        }
      };
      const finalValidation = validateResponse(JSON.stringify(finalFallback));
      if (finalValidation.valid) {
        validation = finalValidation;
      }
    }

    if (!validation.valid) {
      // Log the actual response for debugging
      console.error('Validation failed:', {
        error: validation.error,
        raw: typeof validation.raw === 'string' ? validation.raw.substring(0, 200) : JSON.stringify(validation.raw).substring(0, 200),
        message: message.substring(0, 100)
      });
      
      return sendJson(res, 500, {
        success: false,
        error: validation.error || 'Invalid response from AI',
        raw: typeof validation.raw === 'string' ? validation.raw.substring(0, 500) : validation.raw,
        hint: 'The AI model may have returned an unexpected format. Try rephrasing your question.'
      });
    }

    return sendJson(res, 200, {
      success: true,
      data: validation.data
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.code === 'ECONNREFUSED') {
      return sendJson(res, 503, {
        success: false,
        error: 'Ollama is not running. Please start Ollama first.',
        hint: 'Run: ollama serve'
      });
    }

    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
