const program = require('commander')
const chokidar = require('chokidar')
const tymlyBlueprintsPath = require('./tymly-blueprints-path')
const cache = require('./cache')
const shouldPathBeIgnored = require('./should-path-be-ignored')
const fastify = require('fastify')({ logger: false })
const simulateStateMachineResponse = require('./state-machines')
fastify.register(require('fastify-cors'), {
  origin: true,
  methods: ['POST', 'GET', 'PUT']
})

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
    await cache.applyWatchedFilesToCache(watcher)

    // Set-up remit route
    fastify.post('/executions', async (request, reply) => {
      return simulateStateMachineResponse(request, reply)
    })
    const start = async () => {
      try {
        await fastify.listen(port)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
        console.log(`Listening on ${fastify.server.address().port}`)
      } catch (err) {
        fastify.log.error(err)
        process.exit(1)
      }
    }
    start()
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
