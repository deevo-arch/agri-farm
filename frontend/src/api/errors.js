export function getErrorStatus(err) {
  return err?.response?.status ?? null
}

export function resolveErrorMessage(err) {
  const status = getErrorStatus(err)
  const backendMessage = err?.response?.data?.message

  if (status === 403) return "You don't have permission to perform this action."
  if (status === 404) return backendMessage || 'The requested item could not be found.'
  if (status === 409) return backendMessage || 'This action conflicts with existing data.'
  if (status && status >= 500) return 'Something went wrong. Please try again.'
  if (backendMessage) return backendMessage
  if (err?.request) return 'Unable to reach the server. Please try again.'
  return 'Something went wrong. Please try again.'
}
