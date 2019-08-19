import { Arguments, Argv } from 'yargs'

import { resolve, readSFC } from '../utils'
import infuse from '../infuser'
import fs from 'fs'
import { LocaleMessages, SFCFileInfo } from '../../types'

type InfuseOptions = {
  target: string
  messages: string
}

export const command = 'infuse'
export const aliases = 'inf'
export const describe = 'infuse locale messages to single-file components'

export const builder = (args: Argv): Argv<InfuseOptions> => {
  return args
    .option('target', {
      type: 'string',
      alias: 't',
      describe: 'target path that single-file components is stored',
      demandOption: true
    })
    .option('messages', {
      type: 'string',
      alias: 'o',
      describe: 'locale messages path to be infused',
      demandOption: true
    })
}

export const handler = (args: Arguments<InfuseOptions>): void => {
  const targetPath = resolve(args.target)
  const messagesPath = resolve(args.messages)
  const newSources = infuse(targetPath, readSFC(targetPath), readLocaleMessages(messagesPath))
  writeSFC(newSources)
}

function readLocaleMessages (path: string): LocaleMessages {
  // TODO: async implementation
  const data = fs.readFileSync(path, { encoding: 'utf8' })
  return JSON.parse(data) as LocaleMessages
}

function writeSFC (sources: SFCFileInfo[]) {
  // TODO: async implementation
  sources.forEach(({ path, content }) => {
    fs.writeFileSync(path, content)
  })
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
