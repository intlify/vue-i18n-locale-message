import { LocaleMessageMeta, SFCFileInfo } from '../types'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'

import { parse } from '@vue/component-compiler-utils'
import * as compiler from 'vue-template-compiler'
import path from 'path'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:reflector')

export default function reflectLocaleMessageMeta (basePath: string, components: SFCFileInfo[]): LocaleMessageMeta[] {
  return components.map(target => {
    const desc = parse({
      source: target.content,
      filename: target.path,
      compiler: compiler as VueTemplateCompiler
    })
    const { contentPath, component, messageHierarchy } = parsePath(basePath, target.path)
    const cm = ''
    return {
      contentPath,
      content: cm,
      blocks: desc.customBlocks,
      component,
      messageHierarchy
    }
  })
}

function parsePath (basePath: string, targetPath: string) {
  const parsed = path.parse(targetPath)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, target] = parsed.dir.split(basePath)
  const parsedTargetPath = target.split(path.sep)
  parsedTargetPath.shift()
  debug(`parsePath: contentPath = ${targetPath}, component = ${parsed.name}, messageHierarchy = ${parsedTargetPath}`)
  return {
    contentPath: targetPath,
    component: parsed.name,
    messageHierarchy: parsedTargetPath
  }
}
