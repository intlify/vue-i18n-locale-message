import { Arguments } from 'yargs'
import { SFCDescriptor } from 'vue-template-compiler'
import { SFCFileInfo, FormatOptions } from '../types'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'
import { LocaleMessages, ProviderFactory, ProviderConfiguration } from '../types'

import { parse } from '@vue/component-compiler-utils'
import * as compiler from 'vue-template-compiler'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import JSON5 from 'json5'
import yaml from 'js-yaml'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:utils')

export type PushableOptions = {
  target?: string
  locale?: string
  targetPaths?: string
  filenameMatch?: string
}

const ESC: { [key in string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;'
}

export function escape (s: string): string {
  return s.replace(/[<>"&]/g, escapeChar)
}

function escapeChar (a: string): string {
  return ESC[a] || a
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
