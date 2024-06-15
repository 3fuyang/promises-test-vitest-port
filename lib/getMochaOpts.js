export default function getMochaOpts(args) {
  const rawOpts = args
  const opts = {}

  rawOpts
    .join(' ')
    .split('--')
    .forEach((opt) => {
      const optSplit = opt.split(' ')

      const key = optSplit[0]
      const value = optSplit[1] || true

      if (key) {
        opts[key] = value
      }
    })

  return opts
}
