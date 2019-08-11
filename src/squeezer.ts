import { SFCDescriptor, SFCBlock } from 'vue-template-compiler'
import { LocaleMessages } from '../types'
import { parseContent } from './utils'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:squeezer')

export default function sqeeze (meta: SFCDescriptor[]): LocaleMessages {
  const messages: LocaleMessages = {}

  meta.forEach(target => {
    const blockMessages = squeezeFromI18nBlock(target.customBlocks)
    const locales = Object.keys(blockMessages)
    const collects: LocaleMessages = locales.reduce((messages, locale) => {
      const ret = target.hierarchy.reduce((messages, key) => {
        return Object.assign({}, { [key]: messages })
      }, blockMessages[locale])
      return Object.assign(messages, { [locale]: ret })
    }, {})
    debug('collects', collects)

    locales.forEach(locale => {
      messages[locale] = messages[locale] || {}
      messages[locale] = Object.assign(messages[locale], collects[locale])
    })
  })

  return messages
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
