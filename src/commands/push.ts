import { Arguments, Argv } from 'yargs'

import { resolve } from '../utils'
import path from 'path'
import glob from 'glob'
import { ProviderConstructor, LocaleMessages } from '../../types'
import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:push')

type PushOptions = {
  provider: string
  conf?: string
  target?: string
  locale?: string
  targetPaths?: string
  filenameMatch?: string
  dryRun: boolean
}

export const command = 'push'
export const aliases = 'ph'
export const describe = 'push locale messages to localization service'

export const builder = (args: Argv): Argv<PushOptions> => {
  return args
    .option('provider', {
      type: 'string',
      alias: 'p',
      describe: 'the target localization service provider',
      demandOption: true
    })
    .option('conf', {
      type: 'string',
      alias: 'c',
      describe: 'the json file configration of localization service provider'
    })
    .option('target', {
      type: 'string',
      alias: 't',
      describe: 'target path that locale messages file is stored, default push with the filename of target path as locale'
    })
    .option('locale', {
      type: 'string',
      alias: 'l',
      describe: `option for the locale of locale messages file specified with --target, if it's specified single-file`
    })
    .option('targetPaths', {
      type: 'string',
      alias: 'T',
      describe: 'target directory paths that locale messages files is stored, Can also be specified multi paths with comma delimiter'
    })
    .option('filenameMatch', {
      type: 'string',
      alias: 'm',
      describe: `option should be accepted a regex filenames, must be specified together --targets if it's directory path of locale messages`
    })
    .option('dryRun', {
      type: 'boolean',
      alias: 'd',
      default: false,
      describe: `run the push command, but do not apply to locale messages of localization service`
    })
}

export const handler = (args: Arguments<PushOptions>): void => {
  const ProviderConstructor = loadProvider(args.provider)

  if (ProviderConstructor === null) {
    // TODO: should refactor console message
    console.log(`Not found ${args.provider} provider`)
    return
  }

  let conf
  if (args.conf) {
    conf = loadProviderConf(resolve(args.conf))
  }

  if (!args.target && !args.targetPaths) {
    // TODO: should refactor console message
    console.log('You need to specify either --target or --target-paths')
    return
  }

  let messages: LocaleMessages = {}

  if (args.target) {
    const targetPath = resolve(args.target)
    const parsed = path.parse(targetPath)
    const locale = args.locale ? args.locale : parsed.name
    messages = Object.assign(messages, { [locale]: require(targetPath) })
  } else if (args.targetPaths) {
    const filenameMatch = args.filenameMatch
    if (!filenameMatch) {
      // TODO: should refactor console message
      console.log('You need to specify together --filename-match')
      return
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
          messages = Object.assign(messages, { [locale]: require(fullPath) })
        } else {
          // TODO: should refactor console message
          console.log(`${fullPath} is not matched with ${filenameMatch}`)
        }
      })
    })
  }

  const provider = new ProviderConstructor(conf)
  if (provider.push(messages, args.dryRun)) {
    // TODO: should refactor console message
    console.log('push success')
  } else {
    // TODO: should refactor console message
    console.error('push fail')
  }
}

function loadProvider (provider: string): ProviderConstructor | null {
  let mod: ProviderConstructor | null = null
  try {
    // NOTE: Should we check the interfaces ?
    mod = require(require.resolve(provider)) as ProviderConstructor
  } catch (e) { }
  return mod
}

function loadProviderConf (confPath: string): JSON | undefined {
  let conf
  try {
    conf = require(confPath) as JSON
  } catch (e) { }
  return conf
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
