export function StatusMessage({ error, loading, loadingText = 'Loading…' }) {
  if (loading) {
    return (
      <p className="status" role="status">
        {loadingText}
      </p>
    )
  }
  if (error) {
    return (
      <p className="error" role="alert" data-testid="error-message">
        {error}
      </p>
    )
  }
  return null
}
