import { Arguments, Argv } from 'yargs'
import { LocaleMessages } from '../../types'

import { resolve, readSFC } from '../utils'
import squeeze from '../squeezer'
import fs from 'fs'

type SqueezeOptions = {
  target: string
  output: string
}

export const command = 'squeeze'
export const aliases = 'sqz'
export const describe = 'squeeze locale messages from single-file components'

export const builder = (args: Argv): Argv<SqueezeOptions> => {
  const outputDefault = `${process.cwd()}/messages.json`
  return args
    .option('target', {
      type: 'string',
      alias: 't',
      describe: 'target path that single-file components is stored',
      demandOption: true
    })
    .option('output', {
      type: 'string',
      alias: 'o',
      default: outputDefault,
      describe: 'path to output squeezed locale messages'
    })
}

export const handler = (args: Arguments<SqueezeOptions>): void => {
  const targetPath = resolve(args.target)
  const messages = squeeze(targetPath, readSFC(targetPath))
  writeLocaleMessages(resolve(args.output), messages)
}

function writeLocaleMessages (output: string, messages: LocaleMessages) {
  // TODO: async implementation
  fs.writeFileSync(output, JSON.stringify(messages, null, 2))
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
