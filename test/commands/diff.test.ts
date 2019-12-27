import * as yargs from 'yargs'
import * as path from 'path'

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

// -------------------
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

// ----------
// test cases

test('require option', async () => {
  const diff = await import('../../src/commands/diff')
  const cmd = yargs.command(diff)
  try {
    await new Promise((resolve, reject) => {
      cmd.parse(`push`, (err, argv, output) => {
        err ? reject(err) : resolve(output)
      })
    })
  } catch (e) {
    expect(e).toMatchObject({ name: 'YError' })
  }
})

test('--provider: not found', async () => {
  // run
  const diff = await import('../../src/commands/diff')
  const cmd = yargs.command(diff)
  await new Promise((resolve, reject) => {
    cmd.parse(`diff --provider=./404-provider.js`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify
  expect(spyLog).toHaveBeenCalledWith('Not found ./404-provider.js provider')
})

test('not specified --target and --targetPaths', async () => {
  // run
  const diff = await import('../../src/commands/diff')
  const cmd = yargs.command(diff)
  await new Promise((resolve, reject) => {
    cmd.parse(`diff --provider=l10n-service-provider`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify
  expect(spyLog).toHaveBeenCalledWith('You need to specify either --target or --target-paths')
})

test('--target option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({
    ja: {
      hello: 'こんにちは！',
      nest: {
        world: '世界！'
      }
    }
  }))

  // run
  const diff = await import('../../src/commands/diff')
  const cmd = yargs.command(diff)
  await new Promise((resolve, reject) => {
    cmd.parse(`diff --provider=@scope/l10n-service-provider --target=./test/fixtures/locales/ja.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify with snapshot
  expect(spyLog.mock.calls[0][0]).toMatchSnapshot()
})

test('--locale option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({
    en: {
      hello: 'hello!',
      nest: {
        world: 'world!'
      }
    }
  }))

  // run
  const push = await import('../../src/commands/diff')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`diff --provider=@scope/l10n-service-provider --target=./test/fixtures/locales/lang.json --locale=en`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify with snapshot
  expect(spyLog.mock.calls[0][0]).toMatchSnapshot()
})

test('--target-paths option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({
    en: {
      hello: 'hello!',
      nest: {
        world: 'world!'
      }
    }
  }))

  // run
  const diff = await import('../../src/commands/diff')
  const cmd = yargs.command(diff)
  await new Promise((resolve, reject) => {
    cmd.parse(`diff --provider=@scope/l10n-service-provider --target-paths=./test/fixtures/locales/*.json --filename-match=^([\\w]*)\\.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify with snapshot
  expect(spyLog.mock.calls[1][0]).toMatchSnapshot()
})
