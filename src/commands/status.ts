import { Arguments, Argv } from 'yargs'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:status')

import { getTranslationStatus } from '../utils'
import { TranslationStatusOptions } from '../../types'

type StatusOptions = TranslationStatusOptions

export const command = 'status'
export const aliases = 'st'
export const describe = 'indicate translation status from localization service'

class TranslationStatusError extends Error {}

export const builder = (args: Argv): Argv<StatusOptions> => {
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
    .option('locales', {
      type: 'string',
      alias: 'l',
      default: '',
      describe: `option for some locales of translation status, you can also be specified multi locale with comma delimiter. if it's not specified indicate all locale translation status`
    })
    .fail((msg, err) => {
      if (msg) {
        console.error(msg)
        process.exit(1)
      } else {
        if (err instanceof TranslationStatusError) {
          console.warn(err.message)
          process.exit(1)
        } else {
          if (err) throw err
        }
      }
    })
}

export const handler = async (args: Arguments<StatusOptions>): Promise<unknown> => {
  const { provider, conf, locales } = args
  debug(`status args: provider=${provider}, conf=${conf}, locales=${locales}`)
  const status = await getTranslationStatus({ provider, conf, locales })
  debug('raw status', status)
  console.table(status)

  const completes = status.filter(st => st.percentage < 100)

  return completes.length > 0
    ? Promise.reject(new TranslationStatusError('Translation work in progress'))
    : Promise.resolve('Translation done')
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
