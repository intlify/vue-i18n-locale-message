import { Arguments, Argv } from 'yargs'
import { LocaleMessages, MetaLocaleMessage, Locale } from '../../types'

import { resolve, parsePath, readSFC } from '../utils'
import squeeze from '../squeezer'
import fs from 'fs'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:squeeze')

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
  const meta = squeeze(targetPath, readSFC(targetPath))
  const messages = generate(meta)
  writeLocaleMessages(resolve(args.output), messages)
}

function generate (meta: MetaLocaleMessage): LocaleMessages {
  const { target, components } = meta
  let messages: LocaleMessages = {}

  const assignLocales = (locales: Locale[], messages: LocaleMessages): LocaleMessages => {
    return locales.reduce((messages, locale) => {
      !messages[locale] && Object.assign(messages, { [locale]: {}})
      return messages
    }, messages)
  }

  for (const [component, blocks] of Object.entries(components)) {
    debug(`generate component = ${component}`)
    const parsed = parsePath(target, component)
    messages = blocks.reduce((messages, block) => {
      debug(`generate current messages = ${JSON.stringify(messages)}`)
      const locales = Object.keys(block.messages)
      messages = assignLocales(locales, messages)
      locales.reduce((messages, locale) => {
        if (block.messages[locale]) {
          const localeMessages = messages[locale]
          const localeBlockMessages = block.messages[locale]
          let target: any = localeMessages
          const hierarchy = parsed.hierarchy.concat()
          while (hierarchy.length >= 0) {
            const key = hierarchy.shift()
            if (!key) { break }
            if (!target[key]) {
              target[key] = {}
            }
            target = target[key]
          }
          Object.assign(target, localeBlockMessages)
          return messages
        }
        return messages
      }, messages)
      return messages
    }, messages)
  }

  return messages
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
