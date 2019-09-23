import { Arguments, Argv } from 'yargs'

import { resolve, parsePath, readSFC } from '../utils'
import infuse from '../infuser'
import squeeze from '../squeezer'
import fs from 'fs'
import path from 'path'
import { applyDiff } from 'deep-diff'
import glob from 'glob'
import { LocaleMessages, SFCFileInfo, MetaLocaleMessage, Locale } from '../../types'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:infuse')

type InfuseOptions = {
  target: string
  locales: string
  match?: string
}

export const command = 'infuse'
export const aliases = 'inf'
export const describe = 'infuse locale messages to single-file components'

export const builder = (args: Argv): Argv<InfuseOptions> => {
  return args
    .option('target', {
      type: 'string',
      alias: 't',
      describe: 'target path that single-file components is stored',
      demandOption: true
    })
    .option('locales', {
      type: 'string',
      alias: 'l',
      describe: 'locale messages path to be infused',
      demandOption: true
    })
    .option('match', {
      type: 'string',
      alias: 'm',
      describe: 'option should be accepted a regex filenames, must be specified together --messages'
    })
}

export const handler = (args: Arguments<InfuseOptions>): void => {
  const targetPath = resolve(args.target)
  const messagesPath = resolve(args.locales)
  const sources = readSFC(targetPath)
  const messages = readLocaleMessages(messagesPath, args.match)
  const meta = squeeze(targetPath, sources)
  apply(messages, meta)
  const newSources = infuse(targetPath, sources, meta)
  writeSFC(newSources)
}

function readLocaleMessages (targetPath: string, matchRegex?: string): LocaleMessages {
  debug('readLocaleMessages', targetPath, matchRegex)
  if (!matchRegex) {
    const data = fs.readFileSync(targetPath, { encoding: 'utf8' })
    return JSON.parse(data) as LocaleMessages
  } else {
    const globPath = path.normalize(`${targetPath}/*.json`)
    const paths = glob.sync(globPath)
    return paths.reduce((messages, p) => {
      const re = new RegExp(matchRegex, 'ig')
      const filename = path.basename(p)
      const match = re.exec(filename)
      debug('regex match', match)
      if (match) {
        const data = fs.readFileSync(p, { encoding: 'utf8' })
        Object.assign(messages, { [match[1]]: JSON.parse(data) })
      }
      return messages
    }, {} as LocaleMessages)
  }
}

function removeItem<T> (item: T, items: T[]): boolean {
  const index = items.indexOf(item)
  if (index === -1) { return false }
  items.splice(index, 1)
  return true
}

function apply (messages: LocaleMessages, meta: MetaLocaleMessage): MetaLocaleMessage {
  const { target, components } = meta

  for (const [component, blocks] of Object.entries(components)) {
    debug(`apply component = ${component}, blocks = ${JSON.stringify(blocks)}`)
    const { hierarchy } = parsePath(target, component)

    const collectMessages = getTargetLocaleMessages(messages, hierarchy)
    debug('collect messages', JSON.stringify(collectMessages, null, 2))

    const sourceLocales: Locale[] = Object.keys(collectMessages)
    const targetLocales = blocks.reduce((locales, block) => {
      if (block.locale) {
        locales.push(block.locale)
      } else {
        locales = Object.keys(block.messages).reduce((locales, locale) => {
          locales.push(locale)
          return locales
        }, locales)
      }
      return locales
    }, [] as Locale[])
    debug(`locales: source = ${sourceLocales}, target = ${targetLocales}`)

    blocks.forEach(block => {
      const { locale } = block
      if (locale) {
        applyDiff(block.messages[locale], collectMessages[locale])
        removeItem(locale, sourceLocales)
        removeItem(locale, targetLocales)
      } else {
        const locales: Locale[] = Object.keys(block.messages)
        locales.forEach(locale => {
          applyDiff(block.messages[locale], collectMessages[locale])
          removeItem(locale, sourceLocales)
          removeItem(locale, targetLocales)
        })
      }
    })
    debug(`locales remain: source = ${sourceLocales}, target = ${targetLocales}`)

    if (sourceLocales.length) {
      sourceLocales.forEach(locale => {
        blocks.push({
          lang: 'json',
          locale,
          messages: Object.assign({}, { [locale]: collectMessages[locale] })
        })
      })
    }

    if (targetLocales.length) {
      debug('invalid target remain locales ...', targetLocales.length)
    }
  }

  return meta
}

function getTargetLocaleMessages (messages: LocaleMessages, hierarchy: string[]): LocaleMessages {
  return Object.keys(messages).reduce((target, locale) => {
    debug(`processing curernt: locale=${locale}, target=${JSON.stringify(target)}`)

    const obj = messages[locale]
    if (obj) {
      let o: any = obj
      let prev: any = null
      const h = hierarchy.concat()
      while (h.length > 0) {
        const key = h.shift()
        debug('processing hierarchy key: ', key)

        if (!key || !o) { break }
        o = o[key]
        prev = o
        debug(`processing o = ${JSON.stringify(o)}, prev = ${JSON.stringify(prev)}`)
      }

      if (!o && !prev) {
        return target
      } else {
        return Object.assign(target, { [locale]: ((!o && prev) ? prev : o) }) as LocaleMessages
      }
    } else {
      return target
    }
  }, {} as LocaleMessages)
}

function writeSFC (sources: SFCFileInfo[]) {
  // TODO: async implementation
  sources.forEach(({ path, content }) => {
    fs.writeFileSync(path, content)
  })
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
