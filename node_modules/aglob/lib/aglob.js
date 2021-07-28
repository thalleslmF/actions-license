/**
 * Async glob
 * @function aglob
 * @param {string|string[]} patterns - Pattern
 * @param {Object} [options={}] - Optional settings
 * @returns {Promise}
 */
'use strict'

const glob = require('glob')

/** @lends aglob */
async function aglob (patterns, options = {}) {
  let results = []
  const {cwd = process.cwd(), ignore = [], ...otherOptions} = options
  for (const pattern of [].concat(patterns || [])) {
    const filenames = await new Promise((resolve, reject) =>
      glob(pattern, {ignore,cwd, ...otherOptions}, (err, filenames) =>
        err ? reject(err) : resolve(filenames)
      )
    )
    results = results.concat(filenames)
  }
  return results
}

Object.assign(aglob, {
  sync (patterns, options) {
    return [].concat(patterns || [])
      .reduce((result, pattern) => result.concat(glob.sync(pattern, options)), [])
  }
})

module.exports = aglob
