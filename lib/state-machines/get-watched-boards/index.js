const skeletonResponse = require('./watched-boards')
module.exports = function getWatchedBoardsSimulator (request, reply) {
  console.log('Sending watched boards...')
  const data = JSON.parse(JSON.stringify(skeletonResponse))
  return data
}
