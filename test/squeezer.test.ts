import squeeze from '../src/squeezer'
import metaInfo from './fixtures/meta'
import yamlMetaInfo from './fixtures/format/yaml'
import json5MetaInfo from './fixtures/format/json5'
import { LocaleMessages, LocaleMessageMeta } from '../types'

test('basic', () => {
  const mesasges: LocaleMessages = squeeze(metaInfo as LocaleMessageMeta[])
  expect(mesasges).toMatchSnapshot()
})

test('yaml', () => {
  const mesasges: LocaleMessages = squeeze(yamlMetaInfo as LocaleMessageMeta[])
  expect(mesasges).toMatchSnapshot()
})

test('json5', () => {
  const mesasges: LocaleMessages = squeeze(json5MetaInfo as LocaleMessageMeta[])
  expect(mesasges).toMatchSnapshot()
})
