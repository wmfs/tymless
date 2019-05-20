// TODO: Might make more of this, make it actually resolve?

module.exports = function containsTymlyRefs (obj) {
  let count = 0

  function discoverRefs (root) {
    if (Array.isArray(root)) {
      root.forEach(
        function (el) {
          discoverRefs(el)
        }
      )
    } else if (root && typeof root === 'object') {
      Object.entries(root).forEach(([key, value]) => {
        if (key === '$tymlyRef') {
          count++
        }
        discoverRefs(value)
      })
    }
  }

  discoverRefs(obj)
  return count > 0
}
