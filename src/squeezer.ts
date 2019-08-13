import { SFCBlock } from 'vue-template-compiler'
import { LocaleMessages, SFCFileInfo } from '../types'

import { reflectSFCDescriptor, parseContent } from './utils'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:squeezer')

export default function sqeeze (basePath: string, files: SFCFileInfo[]): LocaleMessages {
  const descriptors = reflectSFCDescriptor(basePath, files)

  return descriptors.reduce((messages, descriptor) => {
    const blockMessages = squeezeFromI18nBlock(descriptor.customBlocks)
    const locales = Object.keys(blockMessages)
    return locales.reduce((messages, locale) => {
      if (!messages[locale]) {
        messages[locale] = {}
      }
      const localeMessages = messages[locale]
      const localeBlockMessages = blockMessages[locale]
      let target: any = localeMessages
      const hierarchy = descriptor.hierarchy.concat()
      while (hierarchy.length >= 0) {
        const key = hierarchy.shift()
        if (!key) { break }
        if (!target[key]) {
          target[key] = {}
        }
        target = target[key]
      }
      Object.assign(target, localeBlockMessages)
      return messages
    }, messages)
  }, {} as LocaleMessages)
}

function squeezeFromI18nBlock (blocks: SFCBlock[]): LocaleMessages {
  return blocks.reduce((messages, block) => {
    debug('i18n block attrs', block.attrs)

    if (block.type === 'i18n') {
      let lang = block.attrs.lang
      lang = (!lang || typeof lang !== 'string') ? 'json' : lang
      const obj = parseContent(block.content, lang)

      const locale = block.attrs.locale
      if (!locale || typeof locale !== 'string') {
        return Object.assign(messages, obj)
      } else {
        return Object.assign(messages, { [locale]: obj })
      }
    } else {
      return messages
    }
  }, {})
}
