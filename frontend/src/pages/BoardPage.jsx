import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { StatusMessage } from '../components/StatusMessage'
import { TaskCard } from '../components/TaskCard'
import { STATUSES } from '../validation'

export function BoardPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [movingId, setMovingId] = useState('')

  useEffect(() => {
    document.title = 'My tasks · Taskboard'
  }, [])

  useEffect(() => {
    let active = true
    api
      .listMyTasks()
      .then((data) => {
        if (active) setTasks(data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load tasks.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function moveTask(task, status) {
    setMovingId(task.id)
    setError('')
    try {
      await api.updateTask(task.id, {
        title: task.title,
        notes: task.notes,
        status,
      })
      setTasks(await api.listMyTasks())
    } catch (err) {
      setError(err.message || 'Could not update that task.')
    } finally {
      setMovingId('')
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>My tasks</h1>
          <p className="lede">Grouped into Todo, In Progress, and Done.</p>
        </div>
        <Link className="button primary" to="/tasks/new">
          New task
        </Link>
      </div>
      <StatusMessage error={error} loading={loading} loadingText="Loading tasks…" />
      {!loading && tasks.length === 0 && !error && (
        <p className="empty-banner" data-testid="empty-state">
          You have no tasks yet. Create one to get started.
        </p>
      )}
      {!loading && (
        <div className="board">
          {STATUSES.map((status) => {
            const items = tasks.filter((task) => task.status === status.value)
            return (
              <section
                key={status.value}
                className={`column column-${status.value}`}
                data-testid={`board-column-${status.value}`}
              >
                <div className="column-head">
                  <h2>{status.label}</h2>
                  <span className="count">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="empty">Nothing in {status.label}.</p>
                ) : (
                  items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      moving={movingId === task.id}
                      onMove={moveTask}
                    />
                  ))
                )}
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}
