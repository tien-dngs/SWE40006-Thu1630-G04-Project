import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { StatusMessage } from '../components/StatusMessage'
import { TaskForm } from '../components/TaskForm'
import { formatWhen } from '../format'
import { statusLabel } from '../validation'

export function TaskDetailPage() {
  const { taskId } = useParams()
  return <TaskDetail key={taskId} taskId={taskId} />
}

function TaskDetail({ taskId }) {
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Task · Taskboard'
  }, [])

  useEffect(() => {
    let active = true
    api
      .getTask(taskId)
      .then((data) => {
        if (!active) return
        setTask(data)
        setLoading(false)
        document.title = `${data.title} · Taskboard`
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Could not open that task.')
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [taskId])

  async function handleSave(values) {
    setNotice('')
    const updated = await api.updateTask(task.id, values)
    setTask(updated)
    setNotice('Saved.')
    setConfirming(false)
  }

  async function handleDelete() {
    setBusy(true)
    setError('')
    try {
      await api.deleteTask(task.id)
      navigate('/tasks')
    } catch (err) {
      setError(err.message || 'Could not delete that task.')
      setBusy(false)
    }
  }

  return (
    <section className="narrow">
      <p className="back">
        <Link to="/tasks">Back to my tasks</Link>
      </p>
      <h1>{task ? task.title : 'Task'}</h1>
      <StatusMessage error={error} loading={loading} loadingText="Loading task…" />
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {task && (
        <>
          <dl className="meta-list">
            <div>
              <dt>Status</dt>
              <dd>{statusLabel(task.status)}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{task.ownerName}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatWhen(task.updatedAt)}</dd>
            </div>
          </dl>
          <TaskForm
            key={`${task.id}-${task.updatedAt}`}
            initialValues={{ title: task.title, notes: task.notes, status: task.status }}
            submitLabel="Save changes"
            onSubmit={handleSave}
          />
          <div className="danger-zone">
            {confirming ? (
              <div data-testid="delete-confirm">
                <p>Delete this task? This cannot be undone.</p>
                <div className="actions">
                  <button
                    type="button"
                    className="danger"
                    onClick={handleDelete}
                    disabled={busy}
                    data-testid="task-delete-confirm"
                  >
                    {busy ? 'Deleting…' : 'Confirm delete'}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} disabled={busy}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="danger"
                onClick={() => setConfirming(true)}
                data-testid="task-delete"
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
