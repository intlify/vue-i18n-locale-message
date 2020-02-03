import { SFCFileInfo, NamespaceDictionary } from '../types'
import deepmerge from 'deepmerge'

import jsonFiles from './fixtures/file/json'
import jsonMetaInfo from './fixtures/meta/json'
import externalLocaleMessages from './fixtures/external'
import squeezeLocaleMessages from './fixtures/squeeze.json'

import {
  reflectSFCDescriptor,
  getTranslationStatus,
  getExternalLocaleMessages,
  splitLocaleMessages
} from '../src/utils'

// ------
// mocks

// l10n service provider module
const mockStatus = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { status: mockStatus }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

test('reflectSFCDescriptor', () => {
  const descriptors = reflectSFCDescriptor('/path/to/project1/src', jsonFiles as SFCFileInfo[])
  expect(descriptors[0].contentPath).toEqual(jsonMetaInfo[0].contentPath)
  expect(descriptors[0].component).toEqual(jsonMetaInfo[0].component)
  expect(descriptors[0].hierarchy).toEqual(jsonMetaInfo[0].hierarchy)
})

test('getTranslationStatus: success', async () => {
  // setup mocks
  const mockStatusValue = [{
    locale: 'en',
    percentage: 24.2
  }]
  mockStatus.mockImplementation(({ locales }) => Promise.resolve(mockStatusValue))

  // run
  const status = await getTranslationStatus({
    provider: '@scope/l10n-service-provider',
    conf: './test/fixtures/conf/l10n-service-provider-conf.json'
  })

  expect(status).toMatchObject(mockStatusValue)
})

test('getTranslationStatus: provider not found', async () => {
  // run
  await expect(getTranslationStatus({
    provider: './404-provider.js'
  })).rejects.toThrow('Not found ./404-provider.js provider')
})

test('getExternalLocaleMessages: basic usage', async () => {
  const namespaces: NamespaceDictionary = {
    './test/fixtures/packages/package1/locales/**/*.json': 'package1',
    './test/fixtures/packages/package2/locales/**/*.json': 'package2'
  }
  const withBundle = './test/fixtures/packages/package1/locales/**/*.json,./test/fixtures/packages/package2/locales/**/*.json'
  const withBundleMatch = '([\\w]*)/([\\w]*)\\.json$'
  const messages = getExternalLocaleMessages(namespaces, withBundle, withBundleMatch)

  expect(messages).toMatchSnapshot()
})

test('getExternalLocaleMessages: no namespace', async () => {
  const withBundle = './test/fixtures/packages/package1/locales/**/*.json,./test/fixtures/packages/package2/locales/**/*.json'
  const withBundleMatch = '([\\w]*)/([\\w]*)\\.json$'
  const messages = getExternalLocaleMessages({}, withBundle, withBundleMatch)

  expect(messages).toMatchSnapshot()
})

test('getExternalLocaleMessages: no filename', async () => {
  const withBundle = './test/fixtures/packages/package1/locales/**/*.json,./test/fixtures/packages/package2/locales/**/*.json'
  const withBundleMatch = '([\\w]*)/[\\w]*\\.json$'
  const messages = getExternalLocaleMessages({}, withBundle, withBundleMatch)

  expect(messages).toMatchSnapshot()
})

test('getExternalLocaleMessages: no bundle option', async () => {
  const namespaces: NamespaceDictionary = {
    './test/fixtures/packages/package1/locales/**/*.json': 'package1',
    './test/fixtures/packages/package2/locales/**/*.json': 'package2'
  }
  const messages = getExternalLocaleMessages(namespaces)

  expect(messages).toMatchObject({})
})

test('splitLocaleMessages: basic usage', async () => {
  const messages = deepmerge(squeezeLocaleMessages, externalLocaleMessages)
  const namespaces: NamespaceDictionary = {
    './test/fixtures/packages/package1/locales/**/*.json': 'package1',
    './test/fixtures/packages/package2/locales/**/*.json': 'package2'
  }
  const unbundleTo = './test/fixtures/packages/package1/locales/**/*.json,./test/fixtures/packages/package2/locales/**/*.json'
  const unbundleMatch = '.*/([\\w]{2})/([\\w]*)\\.json$'
  const { sfc, external } = splitLocaleMessages(messages, namespaces, unbundleTo, unbundleMatch)

  expect(sfc).toEqual(messages)
  external.forEach(ex => {
    expect(ex.messages).toMatchSnapshot()
  })
})

test('splitLocaleMessages: no bundle option', async () => {
  const messages = deepmerge(squeezeLocaleMessages, externalLocaleMessages)
  const namespaces: NamespaceDictionary = {
    './test/fixtures/packages/package1/locales/**/*.json': 'package1',
    './test/fixtures/packages/package2/locales/**/*.json': 'package2'
  }
  const { sfc, external } = splitLocaleMessages(messages, namespaces)

  expect(sfc).toEqual(messages)
  expect(external).toBeUndefined()
})

test('splitLocaleMessages: no namespace', async () => {
  const messages = deepmerge(squeezeLocaleMessages, externalLocaleMessages)
  const namespaces: NamespaceDictionary = {}
  const { sfc, external } = splitLocaleMessages(messages, namespaces)

  expect(sfc).toEqual(messages)
  expect(external).toBeUndefined()
})
