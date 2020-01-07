import { SFCFileInfo } from '../types'

import jsonFiles from './fixtures/file/json'
import jsonMetaInfo from './fixtures/meta/json'
import { reflectSFCDescriptor, getTranslationStatus } from '../src/utils'

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
