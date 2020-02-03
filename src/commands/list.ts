import { flatten, unflatten } from 'flat'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { Arguments, Argv } from 'yargs'

import { LocaleMessageUndefindError, fail } from './fails/list'

import {
  resolve,
  getLocaleMessages
} from '../utils'

import {
  Locale,
  LocaleMessage,
  LocaleMessages
} from '../../types'

type ListOptions = {
  locale: string
  target?: string
  targetPaths?: string
  filenameMatch?: string
  indent: number
  define: boolean
}

type ListFileInfo = {
  path: string
  locale: Locale
  message: LocaleMessage
}

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:list')

const writeFile = promisify(fs.writeFile)

export const command = 'list'
export const aliases = 'lt'
export const describe = 'List undefined fields in locale messages'

export const builder = (args: Argv): Argv<ListOptions> => {
  return args
    .option('locale', {
      type: 'string',
      alias: 'l',
      describe: `the main locale of locale messages`,
      demandOption: true
    })
    .option('target', {
      type: 'string',
      alias: 't',
      describe: 'target path that locale messages file is stored, default list with the filename of target path as locale'
    })
    .option('targetPaths', {
      type: 'string',
      alias: 'T',
      describe: 'target directory paths that locale messages files is stored, Can also be specified multi paths with comma delimiter'
    })
    .option('filenameMatch', {
      type: 'string',
      alias: 'm',
      describe: `option should be accepted a regex filenames, must be specified together --targetPaths if it's directory path of locale messages`
    })
    .option('define', {
      type: 'boolean',
      alias: 'd',
      default: false,
      describe: `if there are undefined fields in the target locale messages, define them with empty string and save them`
    })
    .option('indent', {
      type: 'number',
      alias: 'i',
      default: 2,
      describe: `option for indent of locale message, if you need to adjust with --define option`
    })
    .fail(fail)
}

export const handler = async (args: Arguments<ListOptions>): Promise<unknown> => {
  const { locale, define } = args
  if (!args.target && !args.targetPaths) {
    // TODO: should refactor console message
    return Promise.reject(new Error('You need to specify either --target or --target-paths'))
  }

  const localeMessages = getLocaleMessages(args)
  const flattedLocaleMessages = {} as LocaleMessages
  Object.keys(localeMessages).forEach(locale => {
    flattedLocaleMessages[locale] = flatten(localeMessages[locale])
  })

  const mainLocaleMessage = flattedLocaleMessages[locale]
  if (!mainLocaleMessage) {
    console.error(`Not found main '${locale}' locale message`)
    return
  }

  let valid = true
  Object.keys(flattedLocaleMessages).forEach(l => {
    const message = flattedLocaleMessages[l] as { [prop: string]: LocaleMessage }
    if (!message) {
      console.log(`Not found '${l}' locale messages`)
      valid = false
    } else {
      Object.keys(mainLocaleMessage).forEach(key => {
        if (!message[key]) {
          console.log(`${l}: '${key}' undefined`)
          valid = false
          if (define) {
            message[key] = ''
          }
        }
      })
    }
  })

  if (!define && !valid) {
    return Promise.reject(new LocaleMessageUndefindError('There are undefined fields in the target locale messages, you can define with --define option'))
  }

  const unflattedLocaleMessages = {} as LocaleMessages
  Object.keys(flattedLocaleMessages).forEach(locale => {
    unflattedLocaleMessages[locale] = unflatten(flattedLocaleMessages[locale], { object: true })
  })

  await tweakLocaleMessages(unflattedLocaleMessages, args)

  return Promise.resolve()
}

async function tweakLocaleMessages (messages: LocaleMessages, args: Arguments<ListOptions>) {
  const targets = [] as ListFileInfo[]

  if (args.target) {
    const targetPath = resolve(args.target)
    const parsed = path.parse(targetPath)
    const locale = parsed.name
    targets.push({
      path: targetPath,
      locale,
      message: messages[locale]
    })
  } else if (args.targetPaths) {
    const filenameMatch = args.filenameMatch
    if (!filenameMatch) {
      // TODO: should refactor console message
      throw new Error('You need to specify together --filename-match')
    }
    const targetPaths = args.targetPaths.split(',').filter(p => p)
    targetPaths.forEach(targetPath => {
      const globedPaths = glob.sync(targetPath).map(p => resolve(p))
      globedPaths.forEach(fullPath => {
        const parsed = path.parse(fullPath)
        const re = new RegExp(filenameMatch, 'ig')
        const match = re.exec(parsed.base)
        debug('regex match', match, fullPath)
        if (match && match[1]) {
          const locale = match[1]
          if (args.locale !== locale) {
            targets.push({
              path: fullPath,
              locale,
              message: messages[locale]
            })
          }
        } else {
          // TODO: should refactor console message
          console.log(`${fullPath} is not matched with ${filenameMatch}`)
        }
      })
    })
  }

  if (args.define) {
    for (const fileInfo of targets) {
      await writeFile(fileInfo.path, JSON.stringify(fileInfo.message, null, args.indent))
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
