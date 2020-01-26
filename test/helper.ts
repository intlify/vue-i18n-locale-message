import * as yargs from 'yargs'

export const delay = (msec: number) => {
  return new Promise(resolve => { setTimeout(resolve, msec) })
}

export const flash = () => {
  return new Promise(resolve => { setTimeout(resolve, 1) })
}

export async function runCommand (targetPath: string, command: string) {
  const mod = await import(`../${targetPath}`)
  const cmd = yargs.command(mod)
  return new Promise((resolve, reject) => {
    cmd.parse(command, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
}

export async function yargsParse (targetPath: string, command: string) {
  const mod = await import(targetPath)
  const cmd = patchCommandHandlers(yargs.command(mod))
  return new Promise((resolve, reject) => {
    cmd.parse(command, promiseExitHandler.bind(cmd, resolve, reject))
  })
}

/**
 *  Patch for yargs.parse
 *  See: https://github.com/yargs/yargs/issues/1069#issuecomment-475644072s
 */

export async function promiseExitHandler (resolve, reject, err, argv, output) {
  const help = this.getUsageInstance().help()

  if (err && err.name === 'YError') {
    if (output) err.output = output
    if (help) err.help = help
    return reject(err)
  } else if (err) {
    return reject(err)
  }

  if (argv.___promise) {
    try {
      const result = await argv.___promise
      return resolve(result)
    } catch (err) {
      return reject(err)
    }
  }

  return resolve(output)
}

export function patchCommandHandlers (yargs) {
  const commands = yargs.getCommandInstance().getCommandHandlers()
  for (const commandName of Object.keys(commands)) {
    const command = commands[commandName]
    patchCommandHandler(yargs, command)
    patchCommandBuilder(yargs, command)
  }
  return yargs
}

function patchCommandHandler (yargs, command) {
  const originalHandler = command.___originalHandler || command.handler
  if (typeof originalHandler !== 'function') return

  command.___originalHandler = originalHandler
  command.handler = argv => {
    try {
      argv.___promise = originalHandler(argv)
    } catch (err) {
      argv.___promise = Promise.reject(err)
    }
    return
  }
}

// This patch is needed because subcommands might also have async functions
// as handlers and they are only available once the specific builder for a specific
// command got executed.
function patchCommandBuilder (yargs, command) {
  const originalBuilder = command.___originalBuilder || command.builder
  if (typeof originalBuilder !== 'function') return

  command.___originalBuilder = originalBuilder
  command.builder = argv => {
    const val = originalBuilder(argv)
    // patchCommandHandlers(yargs)
    return val
  }
}
