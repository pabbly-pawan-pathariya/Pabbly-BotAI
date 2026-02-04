import { ClipboardList, CheckCircle, Settings, Info } from 'lucide-react'
import './TaskResponse.css'

function TaskResponse({ data }) {
  const { task_type, task_name, description, inputs = {}, steps = [] } = data

  return (
    <div className="response-card task-response">
      <div className="response-header">
        <span className="response-badge task">TASK</span>
        <ClipboardList size={16} className="header-icon" />
        <span className="response-title">{task_name}</span>
      </div>
      
      <div className="response-body">
        <div className="task-meta">
          <span className="task-type">
            <Settings size={12} />
            {task_type}
          </span>
        </div>
        
        {description && (
          <p className="task-description">
            <Info size={14} />
            {description}
          </p>
        )}
        
        {Object.keys(inputs).length > 0 && (
          <div className="task-inputs">
            <h4>Inputs</h4>
            <div className="inputs-grid">
              {Object.entries(inputs).map(([key, value]) => (
                <div key={key} className="input-item">
                  <span className="input-key">{key}</span>
                  <span className="input-value">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {steps.length > 0 && (
          <div className="task-steps">
            <h4>Execution Steps</h4>
            <div className="steps-list">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{step.step || index + 1}</div>
                  <div className="step-content">
                    <span className="step-action">{step.action}</span>
                    {step.config && Object.keys(step.config).length > 0 && (
                      <div className="step-config">
                        {Object.entries(step.config).map(([key, value]) => (
                          <span key={key} className="config-item">
                            {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <CheckCircle size={16} className="step-check" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskResponse
