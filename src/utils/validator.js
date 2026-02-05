const VALID_MODES = ['QNA', 'WORKFLOW', 'TASK'];

export function validateResponse(responseText) {
  let parsed;

  try {
    parsed = JSON.parse(responseText);
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON response from AI',
      raw: responseText
    };
  }

  // Normalize mode: handle case variations and common typos
  if (parsed.mode) {
    const modeUpper = String(parsed.mode).toUpperCase().trim();
    if (modeUpper.includes('QNA') || modeUpper === 'Q&A' || modeUpper === 'QA') {
      parsed.mode = 'QNA';
    } else if (modeUpper.includes('WORKFLOW') || modeUpper.includes('AUTOMATION')) {
      parsed.mode = 'WORKFLOW';
    } else if (modeUpper.includes('TASK') || modeUpper.includes('ACTION')) {
      parsed.mode = 'TASK';
    } else if (VALID_MODES.includes(modeUpper)) {
      parsed.mode = modeUpper;
    }
  }
  
  if (!parsed.mode || !VALID_MODES.includes(parsed.mode)) {
    return {
      valid: false,
      error: `Invalid mode. Expected one of: ${VALID_MODES.join(', ')}`,
      raw: parsed
    };
  }

  // More lenient: allow missing data or non-object data, we'll fix it in the route
  if (!parsed.data) {
    parsed.data = {}; // Auto-create empty data object
  }
  
  if (typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
    return {
      valid: false,
      error: 'Invalid data object (must be an object, not array or primitive)',
      raw: parsed
    };
  }

  // Mode-specific validation
  const modeValidation = validateModeData(parsed.mode, parsed.data);
  if (!modeValidation.valid) {
    return modeValidation;
  }

  return {
    valid: true,
    data: parsed
  };
}

function validateModeData(mode, data) {
  switch (mode) {
    case 'QNA':
      return validateQNA(data);
    case 'WORKFLOW':
      return validateWorkflow(data);
    case 'TASK':
      return validateTask(data);
    default:
      return { valid: true };
  }
}

function validateQNA(data) {
  // Auto-fix: create answer if missing
  if (!data.answer || typeof data.answer !== 'string') {
    // Check if answer exists as a different field name
    const possibleAnswerFields = ['response', 'text', 'content', 'message', 'reply'];
    let foundAnswer = null;
    
    for (const field of possibleAnswerFields) {
      if (data[field] && typeof data[field] === 'string') {
        foundAnswer = data[field];
        break;
      }
    }
    
    if (foundAnswer) {
      data.answer = foundAnswer;
    } else {
      return {
        valid: false,
        error: 'QNA response must have an "answer" string'
      };
    }
  }
  
  // Ensure arrays exist
  if (!Array.isArray(data.related_features)) {
    data.related_features = [];
  }
  if (!Array.isArray(data.follow_up_suggestions)) {
    data.follow_up_suggestions = [];
  }
  
  return { valid: true };
}

function validateWorkflow(data) {
  if (!data.workflow_name || typeof data.workflow_name !== 'string') {
    return {
      valid: false,
      error: 'WORKFLOW must have a "workflow_name" string'
    };
  }
  if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
    return {
      valid: false,
      error: 'WORKFLOW must have a non-empty "nodes" array'
    };
  }
  if (!Array.isArray(data.edges)) {
    return {
      valid: false,
      error: 'WORKFLOW must have an "edges" array'
    };
  }

  // Validate nodes have required fields
  for (const node of data.nodes) {
    if (typeof node.id !== 'number') {
      return {
        valid: false,
        error: 'Each node must have a numeric "id"'
      };
    }
    if (!node.type || typeof node.type !== 'string') {
      return {
        valid: false,
        error: 'Each node must have a "type" string'
      };
    }
  }

  return { valid: true };
}

function validateTask(data) {
  if (!data.task_type || typeof data.task_type !== 'string') {
    return {
      valid: false,
      error: 'TASK must have a "task_type" string'
    };
  }
  if (!data.task_name || typeof data.task_name !== 'string') {
    return {
      valid: false,
      error: 'TASK must have a "task_name" string'
    };
  }
  return { valid: true };
}
