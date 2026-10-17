import { validateTask } from '../validation'

const STORAGE_KEY = 'taskboard.dev.tasks'
const DEMO_PASSWORD = 'password'

const USERS = [
  {
    id: 'u-alex',
    name: 'Alex Nguyen',
    email: 'alex@example.com',
    role: 'standard',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-jordan',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    role: 'admin',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u-sam',
    name: 'Sam Patel',
    email: 'sam@example.com',
    role: 'standard',
    password: DEMO_PASSWORD,
  },
]

const SEED_TASKS = [
  {
    id: 't-alex-1',
    title: 'Draft weekly notes',
    notes: 'Capture what the group finished for Level 2 monitoring.',
    status: 'todo',
    ownerId: 'u-alex',
    ownerName: 'Alex Nguyen',
    updatedAt: '2026-10-16T01:15:00.000Z',
  },
  {
    id: 't-alex-2',
    title: 'Agree task fields with Member A',
    notes: 'Check title, notes, status, and owner before the real API is connected.',
    status: 'in_progress',
    ownerId: 'u-alex',
    ownerName: 'Alex Nguyen',
    updatedAt: '2026-10-16T04:40:00.000Z',
  },
  {
    id: 't-alex-3',
    title: 'Sketch the board columns',
    notes: 'Todo, In Progress, and Done need to be obvious on a phone and a laptop.',
    status: 'done',
    ownerId: 'u-alex',
    ownerName: 'Alex Nguyen',
    updatedAt: '2026-10-15T08:05:00.000Z',
  },
  {
    id: 't-jordan-1',
    title: 'Review admin visibility',
    notes: 'Admins should see every task. Standard users should see only their own.',
    status: 'in_progress',
    ownerId: 'u-jordan',
    ownerName: 'Jordan Lee',
    updatedAt: '2026-10-16T06:20:00.000Z',
  },
  {
    id: 't-jordan-2',
    title: 'Write the demo sign-in notes',
    notes: 'Keep the development passwords out of production configuration.',
    status: 'done',
    ownerId: 'u-jordan',
    ownerName: 'Jordan Lee',
    updatedAt: '2026-10-14T23:10:00.000Z',
  },
  {
    id: 't-sam-1',
    title: 'Collect tutorial notes',
    notes: 'Sam owns this task. Alex should not be able to open it.',
    status: 'todo',
    ownerId: 'u-sam',
    ownerName: 'Sam Patel',
    updatedAt: '2026-10-16T02:50:00.000Z',
  },
  {
    id: 't-sam-2',
    title: 'File the weekly summary',
    notes: 'Visible to an admin from the management page.',
    status: 'done',
    ownerId: 'u-sam',
    ownerName: 'Sam Patel',
    updatedAt: '2026-10-13T05:30:00.000Z',
  },
]

let currentUser = null
let tasks = null

function storage() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

function copy(task) {
  return { ...task }
}

function readStored() {
  const store = storage()
  if (!store) return null
  const raw = store.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function getTasks() {
  if (!tasks) tasks = readStored() ?? SEED_TASKS.map(copy)
  return tasks
}

function save(next) {
  tasks = next
  const store = storage()
  if (store) store.setItem(STORAGE_KEY, JSON.stringify(next))
}

function wait() {
  return new Promise((resolve) => {
    setTimeout(resolve, 250)
  })
}

function requireUser() {
  if (!currentUser) throw new Error('Sign in to continue.')
  return currentUser
}

function requireAdmin() {
  const user = requireUser()
  if (user.role !== 'admin') throw new Error('Only an admin can do that.')
  return user
}

function canAccess(task, user) {
  return user.role === 'admin' || task.ownerId === user.id
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function byRecent(a, b) {
  return String(b.updatedAt).localeCompare(String(a.updatedAt))
}

function assertValid(input) {
  const { errors, values } = validateTask(input)
  const message = Object.values(errors)[0]
  if (message) throw new Error(message)
  return values
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `t-${Date.now()}`
}

export function setSession(user) {
  if (!user) {
    currentUser = null
    return null
  }
  const known = USERS.find((item) => item.id === user.id)
  currentUser = known ? publicUser(known) : null
  return currentUser
}

export async function login({ email, password }) {
  await wait()
  const normalised = String(email ?? '').trim().toLowerCase()
  const match = USERS.find((user) => user.email === normalised && user.password === password)
  if (!match) throw new Error('Those details do not match a user.')
  return publicUser(match)
}

export async function listMyTasks() {
  await wait()
  const user = requireUser()
  return getTasks()
    .filter((task) => task.ownerId === user.id)
    .map(copy)
    .sort(byRecent)
}

export async function getTask(id) {
  await wait()
  const user = requireUser()
  const task = getTasks().find((item) => item.id === id)
  if (!task) throw new Error('That task could not be found.')
  if (!canAccess(task, user)) throw new Error('You can only open your own tasks.')
  return copy(task)
}

export async function createTask(input) {
  await wait()
  const user = requireUser()
  const clean = assertValid({ status: 'todo', ...input })
  const task = {
    id: newId(),
    ...clean,
    ownerId: user.id,
    ownerName: user.name,
    updatedAt: new Date().toISOString(),
  }
  save([task, ...getTasks()])
  return copy(task)
}

export async function updateTask(id, input) {
  await wait()
  const user = requireUser()
  const all = getTasks()
  const index = all.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('That task could not be found.')
  const current = all[index]
  if (!canAccess(current, user)) throw new Error('You can only change your own tasks.')
  const clean = assertValid({
    title: input.title ?? current.title,
    notes: input.notes ?? current.notes,
    status: input.status ?? current.status,
  })
  const updated = {
    ...current,
    ...clean,
    ownerId: current.ownerId,
    ownerName: current.ownerName,
    updatedAt: new Date().toISOString(),
  }
  const next = all.slice()
  next[index] = updated
  save(next)
  return copy(updated)
}

export async function deleteTask(id) {
  await wait()
  const user = requireUser()
  const all = getTasks()
  const current = all.find((item) => item.id === id)
  if (!current) throw new Error('That task could not be found.')
  if (!canAccess(current, user)) throw new Error('You can only delete your own tasks.')
  save(all.filter((item) => item.id !== id))
}

export async function listUsers() {
  await wait()
  requireAdmin()
  return USERS.map(publicUser)
}

export async function listAllTasks() {
  await wait()
  requireAdmin()
  return getTasks().map(copy).sort(byRecent)
}
