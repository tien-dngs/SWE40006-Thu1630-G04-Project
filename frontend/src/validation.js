export const STATUSES = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function statusLabel(value) {
  return STATUSES.find((status) => status.value === value)?.label ?? value
}

export function validateTask(input) {
  const title = String(input.title ?? '').trim()
  const notes = String(input.notes ?? '').trim()
  const status = input.status
  const errors = {}

  if (!title) errors.title = 'Enter a title.'
  else if (title.length > 120) errors.title = 'Use 120 characters or fewer for the title.'

  if (notes.length > 2000) errors.notes = 'Use 2000 characters or fewer for the notes.'

  if (!STATUSES.some((item) => item.value === status)) {
    errors.status = 'Choose Todo, In Progress, or Done.'
  }

  return { errors, values: { title, notes, status } }
}
