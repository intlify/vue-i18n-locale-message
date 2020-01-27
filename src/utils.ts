// import types
import { Arguments } from 'yargs'
import { SFCDescriptor } from 'vue-template-compiler'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'
import {
  SFCFileInfo,
  Locale,
  LocaleMessages,
  FormatOptions,
  ProviderFactory,
  ProviderConfiguration,
  TranslationStatusOptions,
  TranslationStatus,
  RawLocaleMessage
} from '../types'

// import modules
import { parse } from '@vue/component-compiler-utils'
import * as compiler from 'vue-template-compiler'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import JSON5 from 'json5'
import yaml from 'js-yaml'
import { promisify } from 'util'

import { debug as Debug } from 'debug'
import { worker } from 'cluster'
const debug = Debug('vue-i18n-locale-message:utils')
const readFile = promisify(fs.readFile)

// define types
export type PushableOptions = {
  target?: string
  locale?: string
  targetPaths?: string
  filenameMatch?: string
  format?: string
}
export type NamespaceDictionary = { [path: string]: string }

const ESC: { [key in string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;'
}

function escapeChar (a: string): string {
  return ESC[a] || a
}

export function escape (s: string): string {
  return s.replace(/[<>"&]/g, escapeChar)
}

export function resolve (...paths: string[]): string {
  return path.resolve(...paths)
}

export function reflectSFCDescriptor (basePath: string, components: SFCFileInfo[]): SFCDescriptor[] {
  return components.map(target => {
    const { template, script, styles, customBlocks } = parse({
      source: target.content,
      filename: target.path,
      compiler: compiler as VueTemplateCompiler
    }) as SFCDescriptor
    return {
      ...parsePath(basePath, target.path),
      raw: target.content,
      customBlocks,
      template,
      script,
      styles
    }
  })
}

export function parsePath (basePath: string, targetPath: string) {
  const { dir, name } = path.parse(targetPath)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, target] = dir.split(basePath)
  const parsedTargetPath = target.split(path.sep)
  parsedTargetPath.shift()
  debug(`parsePath: contentPath = ${targetPath}, component = ${name}, messageHierarchy = ${parsedTargetPath}`)
  return {
    contentPath: targetPath,
    component: name,
    hierarchy: [...parsedTargetPath, name]
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseContent (content: string, lang: string): any {
  switch (lang) {
    case 'yaml':
    case 'yml':
      return yaml.safeLoad(content)
    case 'json5':
      return JSON5.parse(content)
    case 'json':
    default:
      return JSON.parse(content)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringifyContent (content: any, lang: string, options?: FormatOptions): string {
  const indent = options?.intend || 2
  const eof = options?.eof || '\n'

  let result = ''
  switch (lang) {
    case 'yaml':
    case 'yml':
      result = yaml.safeDump(content, { indent })
      break
    case 'json5':
      result = JSON5.stringify(content, null, indent)
      break
    case 'json':
    default:
      result = JSON.stringify(content, null, indent)
      break
  }

  if (!result.endsWith(eof)) {
    result += eof
  }

  return result
}

export function readSFC (target: string): SFCFileInfo[] {
  const targets = resolveGlob(target)
  debug('readSFC: targets = ', targets)

  // TODO: async implementation
  return targets.map(target => {
    const data = fs.readFileSync(target)
    return {
      path: target,
      content: data.toString()
    }
  })
}

function resolveGlob (target: string) {
  // TODO: async implementation
  return glob.sync(`${target}/**/*.vue`)
}

export const DEFUALT_CONF = { provider: {}} as ProviderConfiguration

export function resolveProviderConf (provider: string, conf?: string) {
  if (conf) {
    return resolve(conf)
  } else {
    const parsed = path.parse(provider)
    return resolve(process.cwd(), `${parsed.base}-conf.json`)
  }
}

export function loadProvider (provider: string): ProviderFactory | null {
  let mod: ProviderFactory | null = null
  try {
    // TODO: should validate I/F checking & dynamic importing
    const m = require(require.resolve(provider))
    debug('loaderProvider', m)
    if ('__esModule' in m) {
      mod = m.default as ProviderFactory
    } else {
      mod = m as ProviderFactory
    }
  } catch (e) { } // eslint-disable-line
  return mod
}

export function loadProviderConf (confPath: string): ProviderConfiguration {
  let conf = DEFUALT_CONF
  try {
    // TODO: should validate I/F checking & dynamic importing
    conf = require(confPath) as ProviderConfiguration
  } catch (e) { } // eslint-disable-line
  return conf
}

export function getLocaleMessages (args: Arguments<PushableOptions>): LocaleMessages {
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

export function getRawLocaleMessages (args: Arguments<PushableOptions>): RawLocaleMessage[] {
  const messages = [] as RawLocaleMessage[]

  if (args.target) {
    const targetPath = resolve(args.target)
    const parsed = path.parse(targetPath)
    const targetFormat = parsed.ext.split('.').pop()
    const format = targetFormat || args.format
    if (!format) {
      // TODO: should refactor console message
      console.log(`ignore ${targetPath}, due to be not specified with --format`)
    } else {
      messages.push({
        locale: args.locale ? args.locale : parsed.name,
        format,
        data: fs.readFileSync(targetPath)
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
          const targetFormat = parsed.ext.split('.').pop()
          const format = targetFormat || args.format
          if (!format) {
            // TODO: should refactor console message
            console.log(`ignore ${fullPath}, due to be not specified with --format`)
          } else {
            messages.push({
              locale: match[1],
              format,
              data: fs.readFileSync(fullPath)
            })
          }
        } else {
          // TODO: should refactor console message
          console.log(`${fullPath} is not matched with ${filenameMatch}`)
        }
      })
    })
  }

  return messages
}

export async function getTranslationStatus (options: TranslationStatusOptions): Promise<TranslationStatus[]> {
  const ProviderFactory = loadProvider(options.provider)
  if (ProviderFactory === null) {
    return Promise.reject(new Error(`Not found ${options.provider} provider`))
  }

  const confPath = resolveProviderConf(options.provider, options.conf)
  const conf = loadProviderConf(confPath) || DEFUALT_CONF

  const locales = options.locales?.split(',').filter(p => p) as Locale[] || []
  const provider = ProviderFactory(conf)
  const status = await provider.status({ locales })
  return Promise.resolve(status)
}

export async function loadNamespaceDictionary (path: string) {
  const raw = await readFile(resolve(path))
  return new Promise<NamespaceDictionary>((resolv, reject) => {
    try {
      // TODO: should be checked more strongly
      resolv(JSON.parse(raw.toString()) as NamespaceDictionary)
    } catch (e) {
      reject(e)
    }
  })
}

type ParsedLocaleMessagePathInfo = {
  locale: Locale
  filename?: string
}

export function getExternalLocaleMessages (
  dictionary: NamespaceDictionary, withBundle?: string, withBundleMatch?: string
) {
  if (!withBundle) { return {} }

  const getLocaleMessagePathInfo = (fullPath: string, bundleMatch?: string): ParsedLocaleMessagePathInfo => {
    const parsed = path.parse(fullPath)
    debug('getExternalLocaleMessages: parsed', parsed)
    if (bundleMatch) {
      const re = new RegExp(bundleMatch, 'ig')
      const match = re.exec(fullPath)
      debug('getExternalLocaleMessages: regex match', match)
      return {
        locale: (match && match[1]) ? match[1] : '',
        filename: (match && match[2]) ? match[2] : undefined
      }
    } else {
      return {
        locale: parsed.ext.split('.').pop() || ''
      }
    }
  }

  const bundleTargetPaths = withBundle.split(',').filter(p => p)
  return bundleTargetPaths.reduce((messages, targetPath) => {
    const namespace = dictionary[targetPath] || ''
    const globedPaths = glob.sync(targetPath).map(p => resolve(p))
    return globedPaths.reduce((messages, fullPath) => {
      const { locale, filename } = getLocaleMessagePathInfo(fullPath, withBundleMatch)
      if (!locale) { return messages }
      const externalMessages = JSON.parse(fs.readFileSync(fullPath).toString())
      let workMessags = externalMessages
      if (filename) {
        workMessags = Object.assign({}, { [filename]: workMessags })
      }
      if (namespace) {
        workMessags = Object.assign({}, { [namespace]: workMessags })
      }
      debug('getExternalLocaleMessages: workMessages', workMessags)
      if (messages[locale]) {
        messages[locale] = Object.assign(messages[locale], workMessags)
      } else {
        messages = Object.assign(messages, { [locale]: workMessags })
      }
      debug('getExternalLocaleMessages: messages (processing)', messages)
      return messages
    }, messages)
  }, {} as LocaleMessages)
}
