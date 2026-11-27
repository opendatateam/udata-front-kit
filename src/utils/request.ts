// Each call starts a request; the returned check tells if it's still the latest one.
// Call it without using the check to invalidate pending requests.
export const latestRequest = () => {
  let last = 0
  return () => {
    const request = ++last
    return () => request === last
  }
}
