/* eslint-disable-next-line */
/// <reference path="../types/shims-vue-compiler-sfc.d.ts"/>
import { SFCBlock, SFCDescriptor } from '@vue/compiler-sfc'
import { Locale, MetaLocaleMessage, SFCI18nBlock, SFCFileInfo, FormatOptions } from '../types'

import { escape, reflectSFCDescriptor, parseContent, stringifyContent } from './utils'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:infuser')

export default function infuse (basePath: string, sources: SFCFileInfo[], meta: MetaLocaleMessage, options?: FormatOptions): SFCFileInfo[] {
  const descriptors = reflectSFCDescriptor(basePath, sources)

  return descriptors.map(descriptor => {
    return {
      content: generate(meta, descriptor, options),
      path: descriptor.contentPath
    } as SFCFileInfo
  })
}

function generate (meta: MetaLocaleMessage, descriptor: SFCDescriptor, options?: FormatOptions): string {
  const i18nBlocks = meta.components[descriptor.contentPath]
  debug('target i18n blocks\n', i18nBlocks)

  const blocks: SFCBlock[] = getBlocks(descriptor)
  blocks.forEach(b => debug(`block: type=${b.type}, start=${b.loc.start.offset}, end=${b.loc.end.offset}`))

  const { raw } = descriptor
  const content = buildContent(i18nBlocks, raw, blocks, options)
  debug(`build content:\n${content}`)
  debug(`content size: raw=${raw.length}, content=${content.length}`)

  return content
}

function getBlocks (descriptor: SFCDescriptor): SFCBlock[] {
  const { template, script, styles, customBlocks } = descriptor
  const blocks: SFCBlock[] = [...styles, ...customBlocks]
  template && blocks.push(template as SFCBlock)
  script && blocks.push(script as SFCBlock)
  blocks.sort((a, b) => {
    return a.loc.start.offset - b.loc.start.offset
  })
  return blocks
}

function buildContent (i18nBlocks: SFCI18nBlock[], raw: string, blocks: SFCBlock[], options?: FormatOptions): string {
  let offset = 0
  let i18nBlockCounter = 0
  let contents: string[] = []

  contents = blocks.reduce((contents, block) => {
    if (block.type === 'i18n') {
      let lang = block.attrs.lang
      lang = (!lang || typeof lang !== 'string') ? 'json' : lang
      const locale: Locale | true = block.attrs.locale
      const i18nBlock = i18nBlocks[i18nBlockCounter]
      debug(`meta.lang = ${i18nBlock.lang}, block.lang = ${lang}, meta.locale = ${i18nBlock.locale}, block.locale = ${locale}`)

      let messages: any = null // eslint-disable-line
      if (lang === i18nBlock.lang && locale === i18nBlock.locale) {
        if (locale) {
          messages = i18nBlock.messages[locale]
        } else {
          messages = i18nBlock.messages
        }
      } else {
        debug(`unmatch meta block and sfc block`)
        messages = parseContent(block.content, lang)
      }

      contents = contents.concat(raw.slice(offset, block.loc.start.offset))
      const serialized = `\n${stringifyContent(messages, lang, options)}`
      contents = contents.concat(serialized)
      offset = block.loc.end.offset
      i18nBlockCounter++
    } else {
      contents = contents.concat(raw.slice(offset, block.loc.end.offset))
      offset = block.loc.end.offset
    }
    return contents
  }, contents)
  contents = contents.concat(raw.slice(offset, raw.length))

  if (i18nBlocks.length > i18nBlockCounter) {
    i18nBlocks.slice(i18nBlockCounter).reduce((contents, i18nBlock) => {
      contents.push(buildI18nTag(i18nBlock, options))
      return contents
    }, contents)
  }

  return contents.join('')
}

function buildI18nTag (i18nBlock: SFCI18nBlock, options?: FormatOptions): string {
  const { locale, lang, messages } = i18nBlock
  let tag = '<i18n'
  if (locale) {
    tag += ` locale="${escape(locale)}"`
  }
  if (lang !== 'json') {
    tag += ` lang="${escape(lang)}"`
  }
  tag += '>'

  return `\n
${tag}
${stringifyContent(locale ? messages[locale] : messages, lang, options)}</i18n>`
}
