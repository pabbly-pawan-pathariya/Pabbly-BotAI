import QNAResponse from './responses/QNAResponse'
import WorkflowResponse from './responses/WorkflowResponse'
import TaskResponse from './responses/TaskResponse'
import './ResponseRenderer.css'

function ResponseRenderer({ response }) {
  if (!response || !response.mode) {
    return (
      <div className="response-error">
        Invalid response format
      </div>
    )
  }

  const { mode, data } = response

  switch (mode) {
    case 'QNA':
      return <QNAResponse data={data} />
    case 'WORKFLOW':
      return <WorkflowResponse data={data} />
    case 'TASK':
      return <TaskResponse data={data} />
    default:
      return (
        <div className="response-error">
          Unknown mode: {mode}
        </div>
      )
  }
}

export default ResponseRenderer
