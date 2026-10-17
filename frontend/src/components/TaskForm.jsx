import { useState } from 'react'
import { STATUSES, validateTask } from '../validation'

export function TaskForm({ initialValues, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = validateTask(values)
    setErrors(result.errors)
    setFormError('')
    if (Object.keys(result.errors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(result.values)
    } catch (err) {
      setFormError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate data-testid="task-form">
      {formError && (
        <p className="error" role="alert" data-testid="error-message">
          {formError}
        </p>
      )}
      <div className="field">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          name="title"
          data-testid="task-title"
          value={values.title}
          onChange={handleChange}
          maxLength={120}
          required
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>
      <div className="field">
        <label htmlFor="task-notes">Notes</label>
        <textarea
          id="task-notes"
          name="notes"
          data-testid="task-notes"
          value={values.notes}
          onChange={handleChange}
          maxLength={2000}
        />
        {errors.notes && <p className="field-error">{errors.notes}</p>}
      </div>
      <div className="field">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          name="status"
          data-testid="task-status"
          value={values.status}
          onChange={handleChange}
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {errors.status && <p className="field-error">{errors.status}</p>}
      </div>
      <button type="submit" className="primary" data-testid="task-submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
