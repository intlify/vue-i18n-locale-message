import { flash, runCommand } from '../helper'

// -------
// mocking

const mockPull = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { pull: mockPull }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider' // eslint-disable-line

jest.mock('@scope/l10n-omit-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { push: jest.fn() }
  })
})
import L10nOmitServiceProvider from '@scope/l10n-omit-service-provider' // eslint-disable-line

jest.mock('../../src/commands/fails/diff', () => ({
  ...jest.requireActual('../../src/commands/fails/diff'),
  fail: jest.fn()
}))
import diffFail from '../../src/commands/fails/diff'

// -------------------
// setup/teadown hooks

let spyLog
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log')
})

afterEach(() => {
  spyLog.mockRestore()
  jest.clearAllMocks()
})

// ----------
// test cases

test('require option', async () => {
  // mocking ...
  const mockDiffFail = diffFail as jest.Mocked<typeof diffFail>
  mockDiffFail.fail.mockImplementation(() => {})

  // run
  await runCommand('src/commands/diff', `diff`)
  await flash()

  // verify
  expect(mockDiffFail.fail).toHaveBeenCalled()
})

test('--provider: not found', async () => {
  // mocking ...
  const mockDiffFail = diffFail as jest.Mocked<typeof diffFail>
  mockDiffFail.fail.mockImplementation(() => {})

  // run
  await runCommand('src/commands/diff', `diff --provider=./404-provider.js`)
  await flash()

  // verify
  expect(mockDiffFail.fail.mock.calls[0][1].message).toEqual('Not found ./404-provider.js provider')
})

test('not specified --target and --target-paths', async () => {
  // mocking ...
  const mockDiffFail = diffFail as jest.Mocked<typeof diffFail>
  mockDiffFail.fail.mockImplementation(() => {})

  // run
  await runCommand('src/commands/diff', `diff --provider=l10n-service-provider`)
  await flash()

  // verify
  expect(mockDiffFail.fail.mock.calls[0][1].message).toEqual('You need to specify either --target or --target-paths')
})

test('--target option', async () => {
  // mocking ...
  const mockDiffFail = diffFail as jest.Mocked<typeof diffFail>
  mockDiffFail.fail.mockImplementation(() => {})
  mockPull.mockImplementation(() => Promise.resolve({
    ja: {
      hello: 'こんにちは！',
      nest: {
        world: '世界！'
      }
    }
  }))

  // run
  await runCommand(
    'src/commands/diff',
    `diff --provider=@scope/l10n-service-provider \
      --target=./test/fixtures/locales/ja.json`
  )
  await flash()

  // verify
  expect(mockDiffFail.fail.mock.calls[0][1].message).toEqual('There are differences!')
  expect(spyLog.mock.calls[0][0]).toMatchSnapshot()
})

test('--locale option', async () => {
  // mocking ...
  const mockDiffFail = diffFail as jest.Mocked<typeof diffFail>
  mockDiffFail.fail.mockImplementation(() => {})
  mockPull.mockImplementation(() => Promise.resolve({
    en: {
      hello: 'hello!',
      nest: {
        world: 'world!'
      }
    }
  }))

  // run
  await runCommand(
    'src/commands/diff',
    `diff --provider=@scope/l10n-service-provider \
      --target=./test/fixtures/locales/lang.json \
      --locale=en`
  )
  await flash()

  // verify
  expect(mockDiffFail.fail.mock.calls[0][1].message).toEqual('There are differences!')
  expect(spyLog.mock.calls[0][0]).toMatchSnapshot()
})

test('--target-paths option', async () => {
  // mocking ...
  const mockDiffFail = diffFail as jest.Mocked<typeof diffFail>
  mockDiffFail.fail.mockImplementation(() => {})
  mockPull.mockImplementation(() => Promise.resolve({
    en: {
      hello: 'hello!',
      nest: {
        world: 'world!'
      }
    }
  }))

  // run
  await runCommand(
    'src/commands/diff',
    `diff --provider=@scope/l10n-service-provider \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json`
  )
  await flash()

  // verify
  expect(mockDiffFail.fail.mock.calls[0][1].message).toEqual('There are differences!')
  expect(spyLog.mock.calls[1][0]).toMatchSnapshot()
})
