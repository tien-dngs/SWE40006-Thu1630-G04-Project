/**
 * Swap this module in when Member A confirms the API.
 * Leave every path unassigned until then. The UI calls the functions below;
 * it should not contain URLs of its own.
 */
const baseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

let currentSessionUser = null

function unavailable() {
  const where = baseUrl ? ` Configured base URL: ${baseUrl}.` : ' VITE_API_BASE_URL is empty.'
  return Promise.reject(
    new Error(
      `The backend API contract is not confirmed yet.${where} Map the agreed endpoints in src/api/http.js, then set VITE_USE_MOCK=false.`,
    ),
  )
}

export function setSession(user) {
  currentSessionUser = user ?? null
  return currentSessionUser
}

export async function login({email, password}) {
  const response = await fetch(`${baseUrl}/api/users`)
  if (!response.ok) throw new Error(`Failed to fetch users`)
  const users = await response.json()

  const normalised = String(email ?? '').trim().toLowerCase()
  const match = users.find((user) => user.email.toLowerCase() === normalised && user.password === password)
  if (!match) throw new Error('Those details do not match a user.')
  
  currentSessionUser = match
  return match
}

export async function listMyTasks() {
  const response = await fetch(`${baseUrl}/api/tasks`)
  if (!response.ok) throw new Error(`Failed to fetch tasks`)
  const tasks = await response.json()

  if (!currentSessionUser) return []
  if (currentSessionUser.role === 'admin') return tasks
  return tasks.filter((task) => task.ownerId === currentSessionUser.id)
}

export async function getTask(id) {
  const response = await fetch(`${baseUrl}/api/tasks`)
  if (!response.ok) throw new Error(`Failed to fetch tasks`)
  const tasks = await response.json()
  const task = tasks.find((t) => t.id === id)
  if (!task) throw new Error(`Task not found: ${id}`)
  return task
}

export async function createTask(input) {

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
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(newTask),
  })
  
  if (!response.ok) throw new Error(`Failed to create task`)
  return await response.json()
}

export async function updateTask(id, input) {
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(`Failed to update task`)

  const updatedData = await response.json()
  return updatedData
}

export async function deleteTask(id) {
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error(`Failed to delete task`)
  return await response.json()
}

export async function listUsers() {
  const response = await fetch(`${baseUrl}/api/users`)
  if (!response.ok) throw new Error(`Failed to fetch users`)
  return await response.json()
}

export async function listAllTasks() {
  const response = await fetch(`${baseUrl}/api/tasks`)
  if (!response.ok) throw new Error(`Failed to fetch tasks`)
  return await response.json()
}
