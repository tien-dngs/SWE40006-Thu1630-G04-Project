import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/useAuth'
import { StatusMessage } from '../components/StatusMessage'
import { formatWhen, roleLabel } from '../format'
import { statusLabel } from '../validation'

export function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin · Taskboard'
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return undefined
    let active = true
    Promise.all([api.listUsers(), api.listAllTasks()])
      .then(([nextUsers, nextTasks]) => {
        if (!active) return
        setUsers(nextUsers)
        setTasks(nextTasks)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load management data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  if (user?.role !== 'admin') {
    return (
      <section data-testid="admin-forbidden">
        <h1>Admin</h1>
        <p className="error" role="alert">
          This page is for admins. Standard users manage their own tasks from My tasks.
        </p>
        <Link to="/tasks">Back to my tasks</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Admin</h1>
      <p className="lede">Every account and every task. Open a task to edit or delete it.</p>
      <StatusMessage error={error} loading={loading} loadingText="Loading management data…" />
      {!loading && !error && (
        <>
          <h2>Users</h2>
          <div className="table-wrap">
            <table data-testid="admin-users">
              <caption className="sr-only">All users</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>{roleLabel(account.role)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>All tasks</h2>
          {tasks.length === 0 ? (
            <p className="empty" data-testid="empty-state">
              No tasks have been created.
            </p>
          ) : (
            <div className="table-wrap">
              <table data-testid="admin-tasks">
                <caption className="sr-only">All tasks</caption>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{task.ownerName}</td>
                      <td>{statusLabel(task.status)}</td>
                      <td>{formatWhen(task.updatedAt)}</td>
                      <td>
                        <Link to={`/tasks/${task.id}`}>Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}
