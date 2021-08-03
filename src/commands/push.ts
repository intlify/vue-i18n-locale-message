import { Arguments, Argv } from 'yargs'

import { pushFunc } from '../utils'
import { PushOptions } from '../../types'

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
    .option('providerArgs', {
      type: 'string',
      alias: 'pa',
      describe: `option to give parameters to the provider by using strings like URL query parameters (e.g. arg1=1&arg2=2).`
    })
}

export const handler = async (args: Arguments<PushOptions>): Promise<unknown> => {
  const { provider, conf, normalize, dryRun, providerArgs, target, locale, targetPaths, filenameMatch } = args

  try {
    await pushFunc({ provider, conf, normalize, dryRun, providerArgs, target, locale, targetPaths, filenameMatch })
    // TODO: should refactor console message
    console.log('push success')
  } catch {
    return
  }
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
