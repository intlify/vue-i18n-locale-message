import { flash, runCommand } from '../helper'

// ------
// mocks

const mockStatus = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { status: mockStatus }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

jest.mock('../../src/commands/fails/status', () => ({
  ...jest.requireActual('../../src/commands/fails/status'),
  fail: jest.fn()
}))
import statusFail from '../../src/commands/fails/status'

// --------------------
// setup/teadown hooks

let spyLog
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log')
})

afterEach(() => {
  spyLog.mockRestore()
  jest.clearAllMocks()
})

// -----------
// test cases

test('require options', async () => {
  // mocking ...
  const mockStatusFail = statusFail as jest.Mocked<typeof statusFail>
  mockStatusFail.fail.mockImplementation(() => {})

  // run
  await runCommand('src/commands/status', `status`)
  await flash()

  // verify
  expect(mockStatusFail.fail).toHaveBeenCalled()
})

test('getTranslationStatus: done', async () => {
  // setup mocking ...
  const mockStatusFail = statusFail as jest.Mocked<typeof statusFail>
  mockStatusFail.fail.mockImplementation(() => {})
  const mockStatusValue = [{
    locale: 'en',
    percentage: 100
  }, {
    locale: 'ja',
    percentage: 100
  }]
  mockStatus.mockImplementation(() => Promise.resolve(mockStatusValue))

  // run
  await runCommand('src/commands/status', `status --provider=@scope/l10n-service-provider`)
  await flash()

  // verify
  expect(mockStatusFail.fail).not.toHaveBeenCalled()
  expect(spyLog.mock.calls[0][0]).toMatchSnapshot()
})

test('getTranslationStatus: wip', async () => {
  // setup mocking ...
  const mockStatusFail = statusFail as jest.Mocked<typeof statusFail>
  mockStatusFail.fail.mockImplementation(() => {})
  const mockStatusValue = [{
    locale: 'en',
    percentage: 72.4
  }, {
    locale: 'ja',
    percentage: 100
  }]
  mockStatus.mockImplementation(() => Promise.resolve(mockStatusValue))

  // run
  await runCommand('src/commands/status', `status --provider=@scope/l10n-service-provider`)
  await flash()

  // verify
  expect(mockStatusFail.fail.mock.calls[0][1].message).toEqual('Translation work in progress')
  expect(spyLog.mock.calls[0][0]).toMatchSnapshot()
})
