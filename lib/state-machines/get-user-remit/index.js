const cache = require('../../cache')

const skeletonResponse = require('./skeleton-remit')
module.exports = function getWatchedBoardsSimulator (request, reply) {
  console.log('Sending remit...')

  const data = JSON.parse(JSON.stringify(skeletonResponse)) // Make a copy
  const categories = cache.getComponents(
    {
      componentType: 'categories',
      namespacedKey: false,
      formatter: function (key, originalComponentValue) {
        return {
          category: key,
          label: originalComponentValue.label,
          description: originalComponentValue.description,
          styling: {} // Always seems empty?
        }
      }
    }
  )

  const cards = cache.getComponents(
    {
      componentType: 'card-templates',
      namespacedKey: true,
      filter: function (originalComponentValue) {
        return originalComponentValue.hasOwnProperty('templateMeta')
      }
    }
  )
  data.ctx.userRemit.add.categories = categories
  data.ctx.userRemit.add.cards = cards
  return data
}
