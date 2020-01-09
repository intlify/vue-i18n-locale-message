import { Arguments, Argv } from 'yargs'

import {
  resolveProviderConf,
  loadProvider,
  loadProviderConf,
  DEFUALT_CONF,
  getRawLocaleMessages,
  PushableOptions
} from '../utils'

type ImportOptions = {
  provider: string
  conf?: string
  dryRun: boolean
} & PushableOptions

export const command = 'import'
export const aliases = 'imp'
export const describe = 'import locale messages to localization service'

export const builder = (args: Argv): Argv<ImportOptions> => {
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
      describe: 'target path that locale messages file is stored, default import with the filename of target path as locale'
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
    .option('format', {
      type: 'string',
      alias: 'f',
      describe: `the locale messages format option when you want to explicitly specify format to locale message files detected with --target or --targetPaths, you need to specify if these locale message files doesn't have format extension`
    })
    .option('dryRun', {
      type: 'boolean',
      alias: 'd',
      default: false,
      describe: `run the import command, but do not apply to locale messages of localization service`
    })
}

export const handler = async (args: Arguments<ImportOptions>): Promise<unknown> => {
  const { dryRun } = args
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

  try {
    const messages = getRawLocaleMessages(args)
    const provider = ProviderFactory(conf)
    await provider.import({ messages, dryRun })
    // TODO: should refactor console message
    console.log('import success')
  } catch (e) {
    // TODO: should refactor console message
    console.error('import fail:', e.message)
  }
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
