import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { TaskForm } from '../components/TaskForm'

export function NewTaskPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'New task · Taskboard'
  }, [])

  async function handleCreate(values) {
    const created = await api.createTask(values)
    navigate(`/tasks/${created.id}`)
  }

  return (
    <section className="narrow">
      <p className="back">
        <Link to="/tasks">Back to my tasks</Link>
      </p>
      <h1>New task</h1>
      <p className="lede">Add a title, optional notes, and a starting status.</p>
      <TaskForm
        initialValues={{ title: '', notes: '', status: 'todo' }}
        submitLabel="Create task"
        onSubmit={handleCreate}
      />
    </section>
  )
}
