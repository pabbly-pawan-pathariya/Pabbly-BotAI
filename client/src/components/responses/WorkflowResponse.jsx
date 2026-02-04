import { GitBranch, Play, Circle, Square, Clock, ArrowRight, Zap } from 'lucide-react'
import './WorkflowResponse.css'

const nodeIcons = {
  trigger: Play,
  condition: GitBranch,
  action: Zap,
  delay: Clock,
  branch: GitBranch,
  end: Square
}

const nodeColors = {
  trigger: '#10b981',
  condition: '#f59e0b',
  action: '#6366f1',
  delay: '#8b5cf6',
  branch: '#f59e0b',
  end: '#ef4444'
}

function WorkflowResponse({ data }) {
  const { workflow_name, description, nodes = [], edges = [] } = data

  return (
    <div className="response-card workflow-response">
      <div className="response-header">
        <span className="response-badge workflow">WORKFLOW</span>
        <GitBranch size={16} className="header-icon" />
        <span className="response-title">{workflow_name}</span>
      </div>
      
      <div className="response-body">
        {description && (
          <p className="workflow-description">{description}</p>
        )}
        
        <div className="workflow-diagram">
          <h4>Workflow Nodes</h4>
          <div className="nodes-list">
            {nodes.map((node, index) => {
              const Icon = nodeIcons[node.type] || Circle
              const color = nodeColors[node.type] || '#64748b'
              
              return (
                <div key={node.id} className="node-item">
                  <div 
                    className="node-icon" 
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="node-info">
                    <span className="node-name">{node.name}</span>
                    <span className="node-type">{node.type}</span>
                    {node.config && Object.keys(node.config).length > 0 && (
                      <div className="node-config">
                        {Object.entries(node.config).map(([key, value]) => (
                          <span key={key} className="config-item">
                            {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {index < nodes.length - 1 && (
                    <div className="node-connector">
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {edges.length > 0 && (
          <div className="workflow-edges">
            <h4>Connections</h4>
            <div className="edges-list">
              {edges.map((edge, i) => (
                <div key={i} className="edge-item">
                  <span className="edge-from">Node {edge.from}</span>
                  <ArrowRight size={14} />
                  <span className="edge-to">Node {edge.to}</span>
                  {edge.condition && (
                    <span className="edge-condition">({edge.condition})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowResponse
