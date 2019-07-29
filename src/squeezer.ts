import { LocaleMessageMeta, LocaleMessages } from '../types'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'

import { parse } from '@vue/component-compiler-utils'
import * as compiler from 'vue-template-compiler'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-messages:squeezer')

export default function sqeeze (meta: LocaleMessageMeta[]): LocaleMessages {
  const messages: LocaleMessages = {}

  meta.forEach(target => {
    const blockMessages = squeezeFromI18nBlock(target.content)
    const locales = Object.keys(blockMessages)
    const collects: LocaleMessages = locales.reduce((messages, locale) => {
      const ret = target.messageHierarchy.reduce((messages, key) => {
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

function squeezeFromI18nBlock (content: string): LocaleMessages {
  const desc = parse({
    source: content,
    compiler: compiler as VueTemplateCompiler
  })

  return desc.customBlocks.reduce((messages, block) => {
    if (block.type === 'i18n') {
      const obj = JSON.parse(block.content)
      if (block.attrs.locale) {
        return Object.assign(messages, { [block.attrs.locale as string]: obj })
      } else {
        return Object.assign(messages, obj)
      }
    } else {
      return messages
    }
  }, {})
}
