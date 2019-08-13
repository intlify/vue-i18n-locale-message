import { SFCDescriptor, SFCBlock } from 'vue-template-compiler'
import { Locale, LocaleMessages, SFCFileInfo } from '../types'

import { reflectSFCDescriptor, parseContent, stringfyContent } from './utils'
import prettier from 'prettier'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:infuser')

export default function infuse (basePath: string, sources: SFCFileInfo[], messages: LocaleMessages): SFCFileInfo[] {
  const descriptors = reflectSFCDescriptor(basePath, sources)
  const locales = Object.keys(messages)

  return descriptors.map(descriptor => {
    return {
      content: generate(locales, messages, descriptor),
      path: descriptor.contentPath
    } as SFCFileInfo
  })
}

function generate (locales: Locale[], messages: LocaleMessages, descriptor: SFCDescriptor): string {
  const target = getTargetLocaleMessages(locales, messages, descriptor)
  debug('target locale messages\n', target)

  const blocks: SFCBlock[] = getBlocks(descriptor)
  blocks.forEach(b => debug(`block: type=${b.type}, start=${b.start}, end=${b.end}`))

  const { raw } = descriptor
  const content = buildContent(target, raw, blocks)
  debug(`build content:\n${content}`)
  debug(`content size: raw=${raw.length}, content=${content.length}`)

  return format(content, 'vue')
}

function getTargetLocaleMessages (locales: Locale[], messages: LocaleMessages, descriptor: SFCDescriptor): LocaleMessages {
  return locales.reduce((target, locale) => {
    const obj = messages[locale]
    if (obj) {
      let o: any = obj
      const hierarchy = descriptor.hierarchy.concat()
      while (hierarchy.length > 0) {
        const key = hierarchy.shift()
        if (!key) { break }
        o = o[key]
      }
      return Object.assign(target, { [locale]: o }) as LocaleMessages
    } else {
      return target
    }
  }, {} as LocaleMessages)
}

function getBlocks (descriptor: SFCDescriptor): SFCBlock[] {
  const { template, script, styles, customBlocks } = descriptor
  const blocks: SFCBlock[] = [...styles, ...customBlocks]
  template && blocks.push(template as SFCBlock)
  script && blocks.push(script as SFCBlock)
  blocks.sort((a, b) => { return (a.start as number) - (b.start as number) })
  return blocks
}

function buildContent (target: LocaleMessages, raw: string, blocks: SFCBlock[]): string {
  let offset = 0
  let contents: string[] = []
  let targetLocales = Object.keys(target) as Locale[]

  contents = blocks.reduce((contents, block) => {
    if (block.type === 'i18n') {
      let lang = block.attrs.lang
      lang = (!lang || typeof lang !== 'string') ? 'json' : lang

      let messages: any = null
      const locale = block.attrs.locale as Locale
      if (!locale || typeof locale !== 'string') {
        const obj = parseContent(block.content, lang)
        const locales = Object.keys(obj) as Locale[]
        messages = locales.reduce((messages, locale) => {
          return Object.assign(messages, { [locale]: target[locale] })
        }, {} as LocaleMessages)
        locales.forEach(locale => {
          targetLocales = targetLocales.filter(l => l !== locale)
        })
      } else {
        messages = Object.assign({}, target[locale])
        targetLocales = targetLocales.filter(l => l !== locale)
      }

      contents = contents.concat(raw.slice(offset, block.start))
      const serialized = `\n${format(stringfyContent(messages, lang), lang)}`
      contents = contents.concat(serialized)
      offset = block.end as number
    } else {
      contents = contents.concat(raw.slice(offset, block.end))
      offset = block.end as number
    }
    return contents
  }, contents)
  contents = contents.concat(raw.slice(offset, raw.length))

  if (targetLocales.length > 0) {
    contents = targetLocales.reduce((contents, locale) => {
      contents.push(`\n
<i18n locale="${locale}">
${format(stringfyContent(target[locale], 'json'), 'json')}</i18n>`)
      return contents
    }, contents)
  }

  return contents.join('')
}

function format (source: string, lang: string): string {
  switch (lang) {
    case 'vue':
      return prettier.format(source, { parser: 'vue' })
    case 'yaml':
    case 'yml':
      return prettier.format(source, { parser: 'yaml', tabWidth: 2 })
    case 'json5':
      return prettier.format(source, { parser: 'json5', tabWidth: 2 })
    case 'json':
    default:
      return prettier.format(source, { parser: 'json-stringify', tabWidth: 2 })
  }
}
