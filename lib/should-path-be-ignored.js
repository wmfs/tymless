const path = require('path')
const tymlyBlueprintsPath = require('./tymly-blueprints-path')
const IGNORED_DIR_NAMES = [
  'node_modules',
  'test'
]

const IGNORED_COMPONENT_DIRS = [
  'seed-data',
  'pg-scripts',
  'models',
  'functions',
  'forms',
  'boards',
  'rankings',
  'registry-keys'
]

module.exports = function shouldFileBeIgnored (filePath, stats) {
  if (stats) {
    const rel = path.relative(tymlyBlueprintsPath, filePath)
    const parsed = path.parse(rel)
    let type
    if (stats.isDirectory()) {
      type = 'dir'
    } else {
      type = 'file'
    }
    let dirParts
    if (parsed.dir !== '') {
      dirParts = parsed.dir.split(path.sep)
    } else {
      dirParts = []
    }

    if (type === 'dir' && parsed.dir === '') {
      // So top dir, should include that.
      return false
    } else if (type === 'dir' && dirParts.length === 1 && parsed.base[0] !== '.' && IGNORED_DIR_NAMES.indexOf(parsed.base) === -1) {
      // If it's a top-level dir, that's not "hidden" and not explicitly excluded - it needs including.
      return false
    } else if (type === 'file' && dirParts.length === 2 && IGNORED_COMPONENT_DIRS.indexOf(dirParts[1]) === -1) {
      return false
    } else {
      // Ignore it
      return true
    }

    // console.log(`${type}: ${JSON.stringify(parsed)}`)
  }
  return false
}
