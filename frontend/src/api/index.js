import * as httpApi from './http'
import * as mockApi from './mock'

export const usingMockApi = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false'

export const api = usingMockApi ? mockApi : httpApi
