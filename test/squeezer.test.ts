import squeeze from '../src/squeezer'
import jsonMetaInfo from './fixtures/format/json'
import yamlMetaInfo from './fixtures/format/yaml'
import json5MetaInfo from './fixtures/format/json5'
import { SFCDescriptor } from 'vue-template-compiler'

test('basic', () => {
  const messages = squeeze(jsonMetaInfo as SFCDescriptor[])
  expect(messages).toMatchSnapshot()
})

test('yaml', () => {
  const messages = squeeze(yamlMetaInfo as SFCDescriptor[])
  expect(messages).toMatchSnapshot()
})

test('json5', () => {
  const messages = squeeze(json5MetaInfo as SFCDescriptor[])
  expect(messages).toMatchSnapshot()
})
