import { Arguments, Argv } from 'yargs'
const { diffString } = require('json-diff') // NOTE: not provided type definition ...

import {
  resolveProviderConf,
  loadProvider,
  loadProviderConf,
  DEFUALT_CONF,
  getLocaleMessages,
  PushableOptions
} from '../utils'

import { Locale } from '../../types'

type DiffOptions = {
  provider: string
  conf?: string
  normalize?: string
} & PushableOptions

export const command = 'diff'
export const aliases = 'df'
export const describe = 'Diff locale messages between local and localization service'

class DiffError extends Error {}

export const builder = (args: Argv): Argv<DiffOptions> => {
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
    .fail((msg, err) => {
      if (msg) {
        // TODO: should refactor console message
        console.error(msg)
        process.exit(1)
      } else {
        if (err instanceof DiffError) {
          // TODO: should refactor console message
          console.warn(err.message)
          process.exit(64)
        } else {
          // TODO: should refactor console message
          console.error(err.message)
          process.exit(1)
        }
      }
    })
}

export const handler = async (args: Arguments<DiffOptions>): Promise<unknown> => {
  const { normalize } = args
  const format = 'json'
  const ProviderFactory = loadProvider(args.provider)

  if (ProviderFactory === null) {
    throw new Error(`Not found ${args.provider} provider`)
  }

  if (!args.target && !args.targetPaths) {
    // TODO: should refactor console message
    throw new Error('You need to specify either --target or --target-paths')
  }

  const confPath = resolveProviderConf(args.provider, args.conf)
  const conf = loadProviderConf(confPath) || DEFUALT_CONF

  const localeMessages = getLocaleMessages(args)

  const provider = ProviderFactory(conf)
  const locales = Object.keys(localeMessages) as Locale[]
  const serviceMessages = await provider.pull({ locales, dryRun: false, normalize, format })

  const ret = diffString(localeMessages, serviceMessages)
  console.log(ret)

  if (ret) {
    throw new DiffError('There are differences!')
  }

  return Promise.resolve()
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
