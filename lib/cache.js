const tymlyBlueprintPath = require('./tymly-blueprints-path')
const dottie = require('dottie')
const jsonfile = require('jsonfile')
const path = require('path')
const pRetry = require('p-retry')

const cacheableExtensions = [
  '.json'
]

class Cache {
  constructor () {
    this.blueprints = {}
    this.components = {}
  }

  ensureBlueprintJson (blueprintDirName) {
    if (!this.blueprints.hasOwnProperty(blueprintDirName)) {
      const blueprintJsonPath = path.resolve(
        tymlyBlueprintPath,
        blueprintDirName,
        'blueprint.json'
      )
      this.blueprints[blueprintDirName] = jsonfile.readFileSync(
        blueprintJsonPath
      )
    }
    return this.blueprints[blueprintDirName]
  }

  async set (fullPath, options) {
    const run = async () => {
      const parsed = path.parse(fullPath)
      if (parsed.ext !== '' && cacheableExtensions.indexOf(parsed.ext) !== -1) {
        const rel = path.relative(tymlyBlueprintPath, parsed.dir)
        const pathParts = rel.split(path.sep)
        const blueprintJson = this.ensureBlueprintJson(pathParts[0])

        const dottiePath = `${blueprintJson.namespace}.${pathParts[1]}.${parsed.name}`

        let content
        if (parsed.ext === '.json') {
          content = jsonfile.readFileSync(fullPath)
          if (options.log) {
            console.log(`[SET] ${dottiePath}`)
          }
        }
        dottie.set(this.components, dottiePath, content)
      }
    }

    await pRetry(run, {
      retries: 5,
      minTimeout: 100
    })
  }

  async applyWatchedFilesToCache (watcher) {
    const watched = watcher.getWatched()
    for (const [dirPath, filenames] of Object.entries(watched)) {
      for (const filename of filenames) {
        const full = path.join(dirPath, filename)
        await this.set(
          full,
          {
            log: false
          })
      }
    }
  }
}

const cache = new Cache()
module.exports = cache
