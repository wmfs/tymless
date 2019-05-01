const program = require('commander')
const chokidar = require('chokidar')
const tymlyBlueprintsPath = require('./tymly-blueprints-path')
const cache = require('./cache')
const shouldPathBeIgnored = require('./should-path-be-ignored')

function tymless (argv) {
  program
    .option('-p, --port <n>', 'Port server should run on, defaults to 3210', parseInt)
    .parse(argv)

  const port = program.port || 3210

  const watcher = chokidar.watch(
    tymlyBlueprintsPath,
    {
      ignored: function (filePath, stats) { return shouldPathBeIgnored(filePath, stats) },
      ignoreInitial: false
    }
  ).on('ready', async function () {
    console.log('TYMLESS')
    console.log('-------')
    console.log(`tymlyBlueprintsPath: "${tymlyBlueprintsPath}"`)
    console.log(`Port: ${port}`)
    await cache.applyWatchedFilesToCache(watcher)
  }).on('all', async function (event, path) {
    if (event === 'change') {
      await cache.set(
        path,
        {
          log: true
        }
      )
    }
  })
}

module.exports = tymless
