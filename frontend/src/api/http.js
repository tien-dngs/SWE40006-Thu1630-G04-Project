/**
 * Swap this module in when Member A confirms the API.
 * Leave every path unassigned until then. The UI calls the functions below;
 * it should not contain URLs of its own.
 */
const baseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function unavailable() {
  const where = baseUrl ? ` Configured base URL: ${baseUrl}.` : ' VITE_API_BASE_URL is empty.'
  return Promise.reject(
    new Error(
      `The backend API contract is not confirmed yet.${where} Map the agreed endpoints in src/api/http.js, then set VITE_USE_MOCK=false.`,
    ),
  )
}

export function setSession(user) {
  return user ?? null
}

export function login() {
  return unavailable()
}

export function listMyTasks() {
  return unavailable()
}

export function getTask() {
  return unavailable()
}

export function createTask() {
  return unavailable()
}

export function updateTask() {
  return unavailable()
}

export function deleteTask() {
  return unavailable()
}

export function listUsers() {
  return unavailable()
}

export function listAllTasks() {
  return unavailable()
}
