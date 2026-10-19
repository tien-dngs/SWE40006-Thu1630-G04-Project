/**
 * Calls the existing Express API:
 * GET/POST /api/tasks, PUT/DELETE /api/tasks/:id, GET /api/users.
 * Sign-in checks the users list because the API has no separate login route.
 */
const baseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

let currentSessionUser = null

function requireBaseUrl() {
  if (!baseUrl) throw new Error('VITE_API_BASE_URL is empty.')
}

async function readBody(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function setSession(user) {
  currentSessionUser = user ? publicUser(user) : null
  return currentSessionUser
}

export async function login({ email, password }) {
  requireBaseUrl()
  const response = await fetch(`${baseUrl}/api/users`)
  const users = await readBody(response)
  if (!response.ok) throw new Error(users.error || 'Failed to fetch users')

  const normalised = String(email ?? '').trim().toLowerCase()
  const match = users.find(
    (user) => String(user.email ?? '').toLowerCase() === normalised && user.password === password,
  )
  if (!match) throw new Error('Those details do not match a user.')

  currentSessionUser = publicUser(match)
  return currentSessionUser
}

export async function listMyTasks() {
  requireBaseUrl()
  if (!currentSessionUser) throw new Error('Sign in to continue.')
  const response = await fetch(`${baseUrl}/api/tasks`)
  const tasks = await readBody(response)
  if (!response.ok) throw new Error(tasks.error || 'Failed to fetch tasks')

  if (currentSessionUser.role === 'admin') return tasks
  return tasks.filter((task) => task.ownerId === currentSessionUser.id)
}

export async function getTask(id) {
  requireBaseUrl()
  if (!currentSessionUser) throw new Error('Sign in to continue.')
  const response = await fetch(`${baseUrl}/api/tasks`)
  const tasks = await readBody(response)
  if (!response.ok) throw new Error(tasks.error || 'Failed to fetch tasks')
  const task = tasks.find((item) => item.id === id)
  if (!task) throw new Error('That task could not be found.')
  if (currentSessionUser.role !== 'admin' && task.ownerId !== currentSessionUser.id) {
    throw new Error('You can only open your own tasks.')
  }
  return task
}

export async function createTask(input) {
  requireBaseUrl()
  if (!currentSessionUser) throw new Error('Sign in to continue.')

  const tasksResponse = await fetch(`${baseUrl}/api/tasks`)
  const existingTasks = tasksResponse.ok ? await tasksResponse.json() : []

  const userPrefix = currentSessionUser.id.replace('u-', '')

  const userTasks = existingTasks.filter((t) => t.ownerId === currentSessionUser.id)

  let maxNum = 0
  userTasks.forEach((t) => {
    const match = t.id.match(new RegExp(`^t-${userPrefix}-(\\d+)$`))
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  })

  const nextNum = maxNum + 1
  const id = `t-${userPrefix}-${nextNum}`


  const newTask = {
    id,
    title: input.title,
    notes: input.notes,
    status: input.status || 'todo',
    ownerId: currentSessionUser.id,
    ownerName: currentSessionUser.name,
    updatedAt: new Date().toISOString(),
  }

  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  })
  const created = await readBody(response)
  if (!response.ok) throw new Error(created.error || 'Failed to create task')
  return created.id ? created : newTask
}

export async function updateTask(id, input) {
  requireBaseUrl()
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await readBody(response)
  if (!response.ok) throw new Error(body.error || 'Failed to update task')
  return {
    id,
    title: input.title,
    notes: input.notes,
    status: input.status,
    updatedAt: new Date().toISOString(),
  }
}

export async function deleteTask(id) {
  requireBaseUrl()
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, { method: 'DELETE' })
  const body = await readBody(response)
  if (!response.ok) throw new Error(body.error || 'Failed to delete task')
  return body
}

export async function listUsers() {
  requireBaseUrl()
  if (!currentSessionUser) throw new Error('Sign in to continue.')
  if (currentSessionUser.role !== 'admin') throw new Error('Only an admin can do that.')
  const response = await fetch(`${baseUrl}/api/users`)
  const users = await readBody(response)
  if (!response.ok) throw new Error(users.error || 'Failed to fetch users')
  return users.map(publicUser)
}

export async function listAllTasks() {
  requireBaseUrl()
  if (!currentSessionUser) throw new Error('Sign in to continue.')
  if (currentSessionUser.role !== 'admin') throw new Error('Only an admin can do that.')
  const response = await fetch(`${baseUrl}/api/tasks`)
  const tasks = await readBody(response)
  if (!response.ok) throw new Error(tasks.error || 'Failed to fetch tasks')
  return tasks
}
