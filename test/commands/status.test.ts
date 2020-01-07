import * as yargs from 'yargs'
import * as path from 'path'

// ------
// mocks

const mockStatus = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { status: mockStatus }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

// --------------------
// setup/teadown hooks

const PROCESS_CWD_TARGET_PATH = path.resolve(__dirname)

let orgCwd // for process.cwd mock
let spyLog
let spyError
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log')
  spyError = jest.spyOn(global.console, 'error')
  orgCwd = process.cwd
  process.cwd = jest.fn(() => PROCESS_CWD_TARGET_PATH) // mock: process.cwd
})

afterEach(() => {
  spyError.mockRestore()
  spyLog.mockRestore()
  jest.clearAllMocks()
  process.cwd = orgCwd
})

// -----------
// test cases

test('require options', async () => {
  const status = await import('../../src/commands/status')
  const cmd = yargs.command(status)
  try {
    await new Promise((resolve, reject) => {
      cmd.parse(`status`, (err, argv, output) => {
        err ? reject(err) : resolve(output)
      })
    })
  } catch (e) {
    expect(e).toMatchObject({ name: 'YError' })
  }
})

test('getTranslationStatus: success', async () => {
  // setup mocks
  const mockStatusValue = [{
    locale: 'en',
    percentage: 24.2
  }, {
    locale: 'ja',
    percentage: 100.0
  }]
  mockStatus.mockImplementation(({ locales }) => Promise.resolve(mockStatusValue))

  // run
  const status = await import('../../src/commands/status')
  const cmd = yargs.command(status)
  await new Promise((resolve, reject) => {
    cmd.parse(`status --provider=@scope/l10n-service-provider`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
})
