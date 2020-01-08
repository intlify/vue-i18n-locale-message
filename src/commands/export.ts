import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { Arguments, Argv } from 'yargs'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:export')

const mkdirPromisify = promisify(fs.mkdir)
const writeFilePromisify = promisify(fs.writeFile)

import {
  resolveProviderConf,
  loadProvider,
  loadProviderConf,
  DEFUALT_CONF
} from '../utils'
import { Locale, RawLocaleMessage } from '../../types'

type ExportOptions = {
  provider: string
  conf?: string
  output: string
  locales?: string
  format: string
  dryRun: boolean
}

export const command = 'export'
export const aliases = 'ex'
export const describe = 'export locale messages from localization service'

export const builder = (args: Argv): Argv<ExportOptions> => {
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
    .option('output', {
      type: 'string',
      alias: 'o',
      describe: 'the path to output that exported locale messages',
      demandOption: true
    })
    .option('locales', {
      type: 'string',
      alias: 'l',
      default: '',
      describe: `option for some locales of locale messages, you can also be specified multi locale with comma delimiter. if it's not specified export all locale messages`
    })
    .option('format', {
      type: 'string',
      alias: 'f',
      default: 'json',
      describe: 'option for the locale messages format, default `json`'
    })
    .option('dryRun', {
      type: 'boolean',
      alias: 'd',
      default: false,
      describe: 'run the export command, but do not export to locale messages of localization service'
    })
}

export const handler = async (args: Arguments<ExportOptions>): Promise<unknown> => {
  const { dryRun, format } = args
  const ProviderFactory = loadProvider(args.provider)

  if (ProviderFactory === null) {
    // TODO: should refactor console message
    console.log(`Not found ${args.provider} provider`)
    return
  }

  if (!args.output) {
    // TODO: should refactor console message
    console.log('You need to specify --output')
    return
  }

  const confPath = resolveProviderConf(args.provider, args.conf)
  const conf = loadProviderConf(confPath) || DEFUALT_CONF

  try {
    const locales = args.locales?.split(',').filter(p => p) as Locale[] || []
    const provider = ProviderFactory(conf)
    const messages = await provider.export({ locales, dryRun, format })
    await writeRawLocaleMessages(args.output, format, messages, args.dryRun)
    // TODO: should refactor console message
    console.log('export success')
  } catch (e) {
    // TODO: should refactor console message
    console.error('export fail', e)
  }
}

async function writeRawLocaleMessages (output: string, format: string, messages: RawLocaleMessage[], dryRun: boolean) {
  debug('writeRawLocaleMessages', messages, dryRun)

  // wrap mkdir with dryRun
  const mkdir = async (output: string) => {
    return !dryRun
      ? mkdirPromisify(path.resolve(output), { recursive: true })
      : Promise.resolve()
  }

  // wrap writeFile with dryRun
  const writeFile = async (output: string, format: string, message: RawLocaleMessage) => {
    const localePath = path.resolve(output, `${message.locale}.${format}`)
    console.log(`write '${message.locale}' messages to ${localePath}`)
    return !dryRun
      ? writeFilePromisify(localePath, message.data)
      : Promise.resolve()
  }

  // run!
  await mkdir(output)
  for (const message of messages) {
    await writeFile(output, format, message)
  }
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
