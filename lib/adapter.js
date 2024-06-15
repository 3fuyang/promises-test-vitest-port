export const adapter = {
  resolved: (value) => Promise.resolve(value),
  rejected: (reason) => Promise.reject(reason),
  deferred: () => {
    const { promise, resolve, reject } = Promise.withResolvers()
    return { promise, resolve, reject }
  },
}
