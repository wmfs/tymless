const process = require('process')
const path = require('path')

let tymlyBlueprintsPath = process.env.TYMLY_BLUEPRINTS_PATH
if (tymlyBlueprintsPath === undefined) {
  tymlyBlueprintsPath = path.resolve(__dirname, '../../../blueprints')
}

module.exports = tymlyBlueprintsPath
