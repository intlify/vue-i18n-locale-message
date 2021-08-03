import { Arguments, Argv } from 'yargs'
import { DiffError, fail } from './fails/diff'

import { returnDiff } from '../utils'

import { PushableOptions } from '../../types'

type DiffOptions = {
  provider: string
  conf?: string
  normalize?: string
} & PushableOptions

export const command = 'diff'
export const aliases = 'df'
export const describe = 'Diff locale messages between local and localization service'

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
    .fail(fail)
}

export const handler = async (args: Arguments<DiffOptions>): Promise<unknown> => {
  const { provider, conf, normalize, target, locale, targetPaths, filenameMatch } = args

  try {
    const ret = await returnDiff({
      provider, conf, normalize, target, locale, targetPaths, filenameMatch
    })

    if (ret) {
      return Promise.reject(new DiffError('There are differences!'))
    }
    return Promise.resolve()
  } catch (e) {
    console.error(e.message)
    return Promise.reject(e)
  }
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
