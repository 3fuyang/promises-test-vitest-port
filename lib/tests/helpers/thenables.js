import { adapter } from "../../adapter"

const resolved = adapter.resolved
const adapterRejected = adapter.rejected
const deferred = adapter.deferred

const other = { other: "other" } // a value we don't want to be strict equal to

export const fulfilled = {
  "a synchronously-fulfilled custom thenable": (value) => ({
    then: (onFulfilled) => {
      onFulfilled(value)
    },
  }),

  "an asynchronously-fulfilled custom thenable": (value) => ({
    then: (onFulfilled) => {
      setTimeout(() => {
        onFulfilled(value)
      }, 0)
    },
  }),

  "a synchronously-fulfilled one-time thenable": (value) => {
    let numberOfTimesThenRetrieved = 0
    return Object.create(null, {
      then: {
        get() {
          if (numberOfTimesThenRetrieved === 0) {
            ++numberOfTimesThenRetrieved
            return (onFulfilled) => {
              onFulfilled(value)
            }
          }
          return null
        },
      },
    })
  },

  "a thenable that tries to fulfill twice": (value) => ({
    then: (onFulfilled) => {
      onFulfilled(value)
      onFulfilled(other)
    },
  }),

  "a thenable that fulfills but then throws": (value) => ({
    then(onFulfilled) {
      onFulfilled(value)
      throw other
    },
  }),

  "an already-fulfilled promise": (value) => resolved(value),

  "an eventually-fulfilled promise": (value) => {
    const d = deferred()
    setTimeout(() => {
      d.resolve(value)
    }, 50)
    return d.promise
  },
}

export const rejected = {
  "a synchronously-rejected custom thenable": (reason) => ({
    then: (onFulfilled, onRejected) => {
      onRejected(reason)
    },
  }),

  "an asynchronously-rejected custom thenable": (reason) => ({
    then: (onFulfilled, onRejected) => {
      setTimeout(() => {
        onRejected(reason)
      }, 0)
    },
  }),

  "a synchronously-rejected one-time thenable": (reason) => {
    let numberOfTimesThenRetrieved = 0
    return Object.create(null, {
      then: {
        get() {
          if (numberOfTimesThenRetrieved === 0) {
            ++numberOfTimesThenRetrieved
            return (onFulfilled, onRejected) => {
              onRejected(reason)
            }
          }
          return null
        },
      },
    })
  },

  "a thenable that immediately throws in `then`": (reason) => {
    return {
      then: () => {
        throw reason
      },
    }
  },

  "an object with a throwing `then` accessor": (reason) => {
    return Object.create(null, {
      then: {
        get() {
          throw reason
        },
      },
    })
  },

  "an already-rejected promise": (reason) => adapterRejected(reason),

  "an eventually-rejected promise": (reason) => {
    const d = deferred()
    setTimeout(() => {
      d.reject(reason)
    }, 50)
    return d.promise
  },
}
