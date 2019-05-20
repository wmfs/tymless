const containsTymlyRefs = require('./contains-tymly-refs')
const tymlyBlueprintPath = require('./tymly-blueprints-path')
const dottie = require('dottie')
const jsonfile = require('jsonfile')
const path = require('path')
const pRetry = require('p-retry')
const _ = require('lodash')

const cacheableExtensions = [
  '.json'
]

class Cache {
  constructor () {
    this.blueprints = {}
    this.components = {}
  }

  getComponents (options) {
    const results = {}
    Object.entries(this.components).forEach(([namespaceName, ns]) => {
      if (ns.hasOwnProperty(options.componentType)) {
        const components = ns[options.componentType]
        Object.entries(components).forEach(([componentKey, component]) => {
          if ((options.hasOwnProperty('filter') && options.filter(component)) || !options.hasOwnProperty('filter')) {
            let key
            if (options.namespacedKey) {
              key = `${_.camelCase(namespaceName)}_${_.camelCase(componentKey)}_1_0` // TODO: How best to get version number?
            } else {
              key = _.camelCase(componentKey)
            }
            let value
            if (options.hasOwnProperty('formatter')) {
              value = options.formatter(key, component)
            } else {
              value = component
            }
            results[key] = value
          }
        })
      }
    })
    return results
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
          if (!containsTymlyRefs(content)) {
            if (options.log) {
              console.log(`[SET] ${dottiePath}`)
            }
            dottie.set(this.components, dottiePath, content)
          }
        } else {
          dottie.set(this.components, dottiePath, content)
        }
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
