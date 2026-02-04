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

  if (!parsed.mode || !VALID_MODES.includes(parsed.mode)) {
    return {
      valid: false,
      error: `Invalid mode. Expected one of: ${VALID_MODES.join(', ')}`,
      raw: parsed
    };
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    return {
      valid: false,
      error: 'Missing or invalid data object',
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
  if (!data.answer || typeof data.answer !== 'string') {
    return {
      valid: false,
      error: 'QNA response must have an "answer" string'
    };
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
