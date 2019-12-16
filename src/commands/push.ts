import { Arguments, Argv } from 'yargs'

import { resolve } from '../utils'
import path from 'path'
import glob from 'glob'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:push')

import {
  ProviderConstructor,
  ProviderConfiguration,
  ProviderPushResource,
  ProviderPushMode
} from '../../types'

type PushOptions = {
  provider: string
  conf?: string
  target?: string
  locale?: string
  targetPaths?: string
  filenameMatch?: string
  dryRun: boolean
}

const DEFUALT_CONF = { provider: {}, pushMode: 'locale-message' } as ProviderConfiguration

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

export const handler = async (args: Arguments<PushOptions>): Promise<unknown> => {
  const ProviderConstructor = loadProvider(args.provider)

  if (ProviderConstructor === null) {
    // TODO: should refactor console message
    console.log(`Not found ${args.provider} provider`)
    return
  }

  let conf = DEFUALT_CONF
  if (args.conf) {
    conf = loadProviderConf(resolve(args.conf))
  }

  if (!args.target && !args.targetPaths) {
    // TODO: should refactor console message
    console.log('You need to specify either --target or --target-paths')
    return
  }

  let resource
  try {
    resource = getProviderPushResource(args, conf.pushMode)
  } catch (e) {
    console.log(e.message)
    return
  }

  const provider = new ProviderConstructor(conf)
  const ret = await provider.push(resource, args.dryRun)
  if (ret) {
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

function loadProviderConf (confPath: string): ProviderConfiguration {
  let conf = DEFUALT_CONF
  try {
    conf = require(confPath) as ProviderConfiguration
  } catch (e) { }
  return conf
}

function getProviderPushResource (args: Arguments<PushOptions>, mode: ProviderPushMode): ProviderPushResource {
  const resource = { mode } as ProviderPushResource
  debug(`getProviderPushResource: mode=${mode}`)

  if (mode === 'locale-message') {
    resource.messages = {}
  } else { // 'raw-file'
    resource.files = []
  }

  if (args.target) {
    const targetPath = resolve(args.target)
    const parsed = path.parse(targetPath)
    const locale = args.locale ? args.locale : parsed.name
    if (mode === 'locale-message') {
      resource.messages = Object.assign(resource.messages, { [locale]: require(targetPath) })
    } else { // 'file-path'
      resource.files?.push({
        locale,
        path: targetPath
      })
    }
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
          if (mode === 'locale-message') {
            resource.messages = Object.assign(resource.messages, { [locale]: require(fullPath) })
          } else { // 'file-path'
            resource.files?.push({
              locale,
              path: fullPath
            })
          }
        } else {
          // TODO: should refactor console message
          console.log(`${fullPath} is not matched with ${filenameMatch}`)
        }
      })
    })
  }

  return resource
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
