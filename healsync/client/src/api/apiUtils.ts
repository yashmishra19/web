const API_URL = import.meta.env.VITE_API_URL || '/api'

export const isBackendAvailable = async ():
  Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}

export const isNetworkError = (error: any): boolean => {
  return (
    !error?.response ||
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error'
  )
}

export const handleApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (isNetworkError(error)) {
    return 'Running in offline mode.'
  }
  if (error?.response?.status === 401) {
    return 'Session expired. Please log in again.'
  }
  if (error?.response?.status === 409) {
    return error.response.data.message || 'Already exists.'
  }
  return 'Something went wrong. Please try again.'
}
