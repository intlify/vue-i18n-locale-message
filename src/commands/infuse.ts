import { Arguments, Argv } from 'yargs'

import {
  resolve,
  parsePath,
  readSFC,
  loadNamespaceDictionary,
  splitLocaleMessages
} from '../utils'

import infuse from '../infuser'
import squeeze from '../squeezer'
import fs from 'fs'
import path from 'path'
import { applyDiff } from 'deep-diff'
import glob from 'glob'
import {
  Locale,
  LocaleMessages,
  SFCFileInfo,
  MetaLocaleMessage,
  NamespaceDictionary,
  MetaExternalLocaleMessages
} from '../../types'

import { debug as Debug } from 'debug'
const debug = Debug('vue-i18n-locale-message:commands:infuse')

type InfuseOptions = {
  target: string
  locales: string
  match?: string
  unbundleTo?: string
  unbundleMatch?: string
  namespace?: string
  dryRun: boolean
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
    .option('unbundleTo', {
      type: 'string',
      alias: 'u',
      describe: `target path of external locale messages bundled with 'squeeze' command, can also be specified multi paths with comma delimiter`
    })
    .option('unbundleMatch', {
      type: 'string',
      alias: 'M',
      describe: `option should be accepted regex filename of external locale messages, must be specified if it's directory path of external locale messages with --unbundle-to`
    })
    .option('namespace', {
      type: 'string',
      alias: 'n',
      describe: 'file path that defines the namespace for external locale messages bundled together'
    })
    .option('dryRun', {
      type: 'boolean',
      alias: 'd',
      default: false,
      describe: 'run the infuse command, but do not apply them'
    })
}

export const handler = async (args: Arguments<InfuseOptions>) => {
  const targetPath = resolve(args.target)
  const messagesPath = resolve(args.locales)

  let nsDictionary = {} as NamespaceDictionary
  try {
    if (args.namespace) {
      nsDictionary = await loadNamespaceDictionary(args.namespace)
    }
  } catch (e) {
    console.warn('cannot load namespace dictionary')
  }
  debug('namespace dictionary:', nsDictionary)

  const sources = readSFC(targetPath)
  const messages = readLocaleMessages(messagesPath, args.match)

  const { sfc, external } = splitLocaleMessages(messages, nsDictionary, args.unbundleTo, args.unbundleMatch)
  debug('sfc', sfc)
  debug('external', external)

  const meta = squeeze(targetPath, sources)
  apply(sfc, meta)
  const newSources = infuse(targetPath, sources, meta)

  if (!args.dryRun) {
    writeSFC(newSources)
  }

  if (!args.dryRun && external) {
    writeExternalLocaleMessages(external)
  }
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
      let o: any = obj // eslint-disable-line
      let prev: any = null // eslint-disable-line
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

function writeExternalLocaleMessages (meta: MetaExternalLocaleMessages[]) {
  // TODO: async implementation
  meta.forEach(({ path, messages }) => {
    fs.writeFileSync(path, JSON.stringify(messages, null, 2))
  })
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
