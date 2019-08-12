import { SFCFileInfo } from '../types'

import squeeze from '../src/squeezer'
import jsonFiles from './fixtures/file/json'
import yamlFiles from './fixtures/file/yaml'
import json5Files from './fixtures/file/json5'

test('basic', () => {
  const messages = squeeze('/path/to/project1/src', jsonFiles as SFCFileInfo[])
  expect(messages).toMatchSnapshot()
})

test('yaml', () => {
  const messages = squeeze('/path/to/project1/src', yamlFiles as SFCFileInfo[])
  expect(messages).toMatchSnapshot()
})

test('json5', () => {
  const messages = squeeze('/path/to/project1/src', json5Files as SFCFileInfo[])
  expect(messages).toMatchSnapshot()
})
