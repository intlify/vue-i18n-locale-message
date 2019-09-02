import { SFCBlock } from 'vue-template-compiler'
import { LocaleMessages, SFCFileInfo } from '../types'

import { reflectSFCDescriptor, parseContent } from './utils'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:squeezer')

export default function sqeeze (basePath: string, files: SFCFileInfo[]): LocaleMessages {
  const descriptors = reflectSFCDescriptor(basePath, files)

  return descriptors.reduce((messages, descriptor) => {
    const blockMessages = squeezeFromI18nBlock(descriptor.customBlocks)
    debug('squeezeFromI18nBlock: blockMessages', JSON.stringify(blockMessages, null, 2))

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
    debug('i18n block messages', JSON.stringify(messages, null, 2))

    if (block.type === 'i18n') {
      let lang = block.attrs.lang
      lang = (!lang || typeof lang !== 'string') ? 'json' : lang
      const obj = parseContent(block.content, lang)

      const locale = block.attrs.locale
      if (!locale || typeof locale !== 'string') {
        const locales = [...new Set([...Object.keys(messages), ...Object.keys(obj)])]
        locales.forEach(locale => {
          if (messages[locale] && obj[locale]) {
            messages[locale] = Object.assign(messages[locale], obj[locale])
          } else if (!messages[locale] && obj[locale]) {
            messages = Object.assign(messages, obj)
          }
        })
        return messages
      } else {
        if (messages[locale]) {
          messages[locale] = Object.assign(messages[locale], obj)
        } else {
          messages = Object.assign(messages, { [locale]: obj })
        }
        return messages
      }
    } else {
      return messages
    }
  }, {} as LocaleMessages)
}
