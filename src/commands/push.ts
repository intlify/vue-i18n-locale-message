import { Arguments, Argv } from 'yargs'

import {
  resolve,
  resolveProviderConf,
  loadProvider,
  loadProviderConf,
  DEFUALT_CONF
} from '../utils'
import path from 'path'
import glob from 'glob'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:push')

import { LocaleMessages } from '../../types'

type PushOptions = {
  provider: string
  conf?: string
  target?: string
  locale?: string
  targetPaths?: string
  filenameMatch?: string
  normalize?: string
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
      describe: 'the json file configration of localization service provider. If omitted, use the suffix file name with `-conf` for provider name of --provider (e.g. <provider>-conf.json).'
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
    .option('normalize', {
      type: 'string',
      alias: 'n',
      describe: 'option for the locale messages structure, you can specify the option, if you hope to normalize for the provider.'
    })
    .option('dryRun', {
      type: 'boolean',
      alias: 'd',
      default: false,
      describe: `run the push command, but do not apply to locale messages of localization service`
    })
}

export const handler = async (args: Arguments<PushOptions>): Promise<unknown> => {
  const { dryRun, normalize } = args
  const ProviderFactory = loadProvider(args.provider)

  if (ProviderFactory === null) {
    // TODO: should refactor console message
    console.log(`Not found ${args.provider} provider`)
    return
  }

  if (!args.target && !args.targetPaths) {
    // TODO: should refactor console message
    console.log('You need to specify either --target or --target-paths')
    return
  }

  const confPath = resolveProviderConf(args.provider, args.conf)
  const conf = loadProviderConf(confPath) || DEFUALT_CONF

  let messages
  try {
    messages = getLocaleMessages(args)
  } catch (e) {
    console.log(e.message)
    return
  }

  try {
    const provider = ProviderFactory(conf)
    await provider.push({ messages, dryRun, normalize })
    // TODO: should refactor console message
    console.log('push success')
  } catch (e) {
    // TODO: should refactor console message
    console.error('push fail', e)
  }
}

function getLocaleMessages (args: Arguments<PushOptions>): LocaleMessages {
  let messages = {} as LocaleMessages

  if (args.target) {
    const targetPath = resolve(args.target)
    const parsed = path.parse(targetPath)
    const locale = args.locale ? args.locale : parsed.name
    messages = Object.assign(messages, { [locale]: require(targetPath) })
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
          messages = Object.assign(messages, { [locale]: require(fullPath) })
        } else {
          // TODO: should refactor console message
          console.log(`${fullPath} is not matched with ${filenameMatch}`)
        }
      })
    })
  }

  return messages
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
