import { usingMockApi } from '../api'

export function MockBanner() {
  if (!usingMockApi) return null
  return (
    <p className="banner" data-testid="mock-banner" role="status">
      Development data only. The backend API is not connected yet.
    </p>
  )
}
