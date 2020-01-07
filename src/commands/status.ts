import { Arguments, Argv } from 'yargs'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:status')

import { getTranslationStatus } from '../utils'
import { TranslationStatusOptions } from '../../types'

type StatusOptions = TranslationStatusOptions

export const command = 'status'
export const aliases = 'st'
export const describe = 'indicate translation status from localization service'

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
}

export const handler = async (args: Arguments<StatusOptions>): Promise<unknown> => {
  try {
    const { provider, conf, locales } = args
    const status = await getTranslationStatus({ provider, conf, locales })
    debug('raw status', status)
    // TODO: should be refactored console outputing!
    status.forEach(st => {
      console.log(`${st.locale}: ${st.percentage} %`)
    })
  } catch (e) {
    console.error('status fail', e)
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
