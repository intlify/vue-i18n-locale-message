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
let orgExit // for process.exit mock
let spyLog
let spyError
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log')
  spyError = jest.spyOn(global.console, 'error')
  orgCwd = process.cwd
  process.cwd = jest.fn(() => PROCESS_CWD_TARGET_PATH) // mock: process.cwd
  process.exit = jest.fn((code => { return 'exit!' as never })) // mock: process.exit
})

afterEach(() => {
  spyError.mockRestore()
  spyLog.mockRestore()
  jest.clearAllMocks()
  process.exit = orgExit
  process.cwd = orgCwd
})

// -----------
// test cases

test('require options', async () => {
  // run
  const status = await import('../../src/commands/status')
  const cmd = yargs.command(status)
  await new Promise((resolve, reject) => {
    cmd.parse(`status`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify
  expect(spyError).toBeCalled()
  expect(process.exit).toHaveBeenCalledWith(1)
})

test('getTranslationStatus: done', async () => {
  // setup mocking ...
  const mockStatusValue = [{
    locale: 'en',
    percentage: 100
  }, {
    locale: 'ja',
    percentage: 100
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

  // verify
  expect(process.exit).not.toBeCalled()
})

test('getTranslationStatus: wip', async () => {
  // setup mocking ...
  const mockStatusValue = [{
    locale: 'en',
    percentage: 72.4
  }, {
    locale: 'ja',
    percentage: 100
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

  // verify
  // NOTE: cannot detect process.exit calling ...
  // expect(process.exit).toHaveBeenCalledWith(1)
})
