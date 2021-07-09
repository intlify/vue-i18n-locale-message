import { Arguments, Argv } from 'yargs'
import {
  resolve,
  parsePath,
  readSFC,
  loadNamespaceDictionary,
  getExternalLocaleMessages,
  readIgnoreFile,
  returnIgnoreInstance
} from '../utils'
import squeeze from '../squeezer'
import fs from 'fs'
import deepmerge from 'deepmerge'

import {
  Locale,
  LocaleMessages,
  MetaLocaleMessage,
  NamespaceDictionary
} from '../../types'

import { debug as Debug } from 'debug'
import ignore from 'ignore'
const debug = Debug('vue-i18n-locale-message:commands:squeeze')

type SqueezeOptions = {
  target: string
  split?: boolean
  bundleWith?: string
  bundleMatch?: string
  namespace?: string
  output: string
  ignorePath?: string
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
    .option('split', {
      type: 'boolean',
      alias: 's',
      default: false,
      describe: 'split squeezed locale messages with locale'
    })
    .option('bundleWith', {
      type: 'string',
      alias: 'b',
      describe: 'target path of external locale messages that it will bundle together, can also be specified multi paths with comma delimiter'
    })
    .option('bundleMatch', {
      type: 'string',
      alias: 'm',
      describe: `option should be accepted regex filename of external locale messages, must be specified if it's directory path of external locale messages with --with-bundle`
    })
    .option('namespace', {
      type: 'string',
      alias: 'n',
      describe: 'file path that defines the namespace for external locale messages bundled together'
    })
    .option('output', {
      type: 'string',
      alias: 'o',
      default: outputDefault,
      describe: 'path to output squeezed locale messages'
    })
    .option('ignorePath', {
      type: 'string',
      alias: 'i',
      describe: 'path to dot ignore file, i.e. ./.ignore-i18n'
    })
}

export const handler = async (args: Arguments<SqueezeOptions>) => {
  const targetPath = resolve(args.target)

  let nsDictionary = {} as NamespaceDictionary
  let externalMessages = {} as LocaleMessages
  const ig = ignore()
  if (args.ignorePath && fs.existsSync(args.ignorePath)) {
    const ignoreFiles = readIgnoreFile(args.ignorePath)
    returnIgnoreInstance(ig, ignoreFiles)
  }
  try {
    if (args.namespace) {
      nsDictionary = await loadNamespaceDictionary(args.namespace)
    }
    externalMessages = getExternalLocaleMessages(nsDictionary, ig, args.bundleWith, args.bundleMatch)
  } catch (e) {
    console.warn('cannot load external locale messages failed')
  }

  const meta = squeeze(targetPath, readSFC(targetPath, ig))
  const messages = deepmerge(generate(meta), externalMessages)

  writeLocaleMessages(messages, args)
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
          let target: any = localeMessages // eslint-disable-line
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

function writeLocaleMessages (messages: LocaleMessages, args: Arguments<SqueezeOptions>) {
  // TODO: async implementation
  const split = args.split
  const output = resolve(args.output)
  if (!split) {
    fs.writeFileSync(output, JSON.stringify(messages, null, 2))
  } else {
    splitLocaleMessages(output, messages)
  }
}

function splitLocaleMessages (path: string, messages: LocaleMessages) {
  const locales: Locale[] = Object.keys(messages)
  const write = () => {
    locales.forEach(locale => {
      fs.writeFileSync(`${path}/${locale}.json`, JSON.stringify(messages[locale], null, 2))
    })
  }
  try {
    fs.mkdirSync(path)
    write()
  } catch (err) {
    if (err.code === 'EEXIST') {
      write()
    } else {
      console.error(err.message)
      throw err
    }
  }
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
