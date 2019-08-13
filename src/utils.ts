import { SFCDescriptor } from 'vue-template-compiler'
import { SFCFileInfo } from '../types'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'

import { parse } from '@vue/component-compiler-utils'
import * as compiler from 'vue-template-compiler'
import path from 'path'
import JSON5 from 'json5'
import yaml from 'js-yaml'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:utils')

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

function parsePath (basePath: string, targetPath: string) {
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

export function stringfyContent (content: any, lang: string): string {
  switch (lang) {
    case 'yaml':
    case 'yml':
      const s = yaml.safeDump(content, { indent: 20 })
      debug('yaml:', s)
      return s
    case 'json5':
      return JSON5.stringify(content, null, 2)
    case 'json':
    default:
      return JSON.stringify(content, null, 2)
  }
}
