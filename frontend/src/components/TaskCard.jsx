import { Link } from 'react-router-dom'
import { excerpt, formatWhen } from '../format'

const NEXT = {
  todo: { status: 'in_progress', label: 'Start' },
  in_progress: { status: 'done', label: 'Complete' },
  done: { status: 'todo', label: 'Reopen' },
}

export function TaskCard({ task, moving, onMove }) {
  const action = NEXT[task.status]
  const preview = excerpt(task.notes)

  return (
    <article className="card" data-testid={`task-card-${task.id}`}>
      <h3>
        <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      </h3>
      {preview && <p className="excerpt">{preview}</p>}
      <p className="meta">{formatWhen(task.updatedAt)}</p>
      {action && (
        <button
          type="button"
          onClick={() => onMove(task, action.status)}
          disabled={moving}
          aria-label={`${action.label} ${task.title}`}
        >
          {action.label}
        </button>
      )}
    </article>
  )
}
