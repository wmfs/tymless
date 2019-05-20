const simulators = {
  tymly_getWatchedBoards_1_0: require('./get-watched-boards'),
  tymly_getUserRemit_1_0: require('./get-user-remit')
}

module.exports = function simulateStateMachineResponse (request, reply) {
  const stateMachineName = request.body.stateMachineName
  let data
  if (request.body.stateMachineName) {
    console.log('')
    console.log('------------------------------------------------------------------------------')
    console.log(`stateMachineName: ${request.body.stateMachineName}`)
    console.log(`input: ${JSON.stringify(request.body.input)}`)
    console.log(`options: ${JSON.stringify(request.body.options)}`)
    if (simulators.hasOwnProperty(stateMachineName)) {
      data = simulators[stateMachineName](request, reply)
    }
    console.log('------------------------------------------------------------------------------')
    console.log('')
  }
  return data
}
