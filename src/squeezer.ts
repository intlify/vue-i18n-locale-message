import { SFCBlock } from 'vue-template-compiler'
import { MetaLocaleMessage, I18nLang, SFCFileInfo, SFCI18nBlock } from '../types'

import { reflectSFCDescriptor, parseContent } from './utils'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:squeezer')

export default function sqeeze (basePath: string, files: SFCFileInfo[]): MetaLocaleMessage {
  const descriptors = reflectSFCDescriptor(basePath, files)
  return descriptors.reduce((meta, descriptor) => {
    descriptor.customBlocks.sort((a, b) => { return (a.start as number) - (b.start as number) })
    const i18nBlocks = squeezeFromCustomBlocks(descriptor.customBlocks)
    debug('squeezeFromCustomBlocks: i18nBlocks', JSON.stringify(i18nBlocks, null, 2))
    meta.components[descriptor.contentPath] = i18nBlocks
    return meta
  }, { target: basePath, components: {}} as MetaLocaleMessage)
}

function squeezeFromCustomBlocks (blocks: SFCBlock[]): SFCI18nBlock[] {
  return blocks.map(block => {
    if (block.type === 'i18n') {
      debug('i18n block attrs', block.attrs)

      let lang = block.attrs.lang
      lang = (!lang || typeof lang !== 'string') ? 'json' : lang

      const i18nBlock: SFCI18nBlock = {
        lang: lang as I18nLang,
        messages: {}
      }
      const obj = parseContent(block.content, lang)

      const locale = block.attrs.locale
      if (!locale || typeof locale !== 'string') {
        Object.assign(i18nBlock.messages, obj)
      } else {
        i18nBlock.locale = locale
        Object.assign(i18nBlock.messages, { [locale]: obj })
      }

      return i18nBlock
    }
  }).filter(Boolean) as SFCI18nBlock[]
}
