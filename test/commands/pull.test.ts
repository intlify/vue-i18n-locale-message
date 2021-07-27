import * as yargs from 'yargs'
import * as path from 'path'

// ------
// mocks

// l10n service provider module
const mockPull = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { pull: mockPull }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

jest.mock('@scope/l10n-omit-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { pull: jest.fn()
      .mockImplementation(locales => {
        return Promise.resolve({ ja: { hello: 'hello' }, en: { hello: 'こんにちわわわ！' }})
      })
    }
  })
})
import L10nOmitServiceProvider from '@scope/l10n-omit-service-provider'

// fs module
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdir: jest.fn(),
  writeFile: jest.fn()
}))
import fs from 'fs'

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
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  try {
    await new Promise((resolve, reject) => {
      cmd.parse(`pull`, (err, argv, output) => {
        err ? reject(err) : resolve(output)
      })
    })
  } catch (e) {
    expect(e).toMatchObject({ name: 'YError' })
  }
})

test('--provider: not found', async () => {
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=./404-provider.js \
      --output=./foo`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
  expect(spyLog).toHaveBeenCalledWith('Not found ./404-provider.js provider')
})

test('--conf option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({ ja: {}, en: {}}))

  // run
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-service-provider \
      --conf=./test/fixtures/conf/l10n-service-provider-conf.json \
      --output=./test/fixtures/locales \
      --dry-run`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(L10nServiceProvider).toHaveBeenCalledWith({
    provider: { token: 'xxx' }
  })
})

test('--conf option omit', async () => {
  // run
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-omit-service-provider \
      --output=./test/fixtures/locales \
      --dry-run`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(L10nOmitServiceProvider).toHaveBeenCalledWith({
    provider: { token: 'yyy' }
  })
})

test('--locales option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({ ja: {}, en: {}}))

  // run
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --locales=en,ja,fr \
      --dry-run`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPull).toHaveBeenCalledWith({
    locales: ['en', 'ja', 'fr'],
    format: 'json',
    dryRun: true,
    normalize: undefined
  })
})

test('--output option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({ ja: { hello: 'hello' }, en: { hello: 'こんにちわわわ！' }}))
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.mkdir.mockImplementation((p, option, cb) => cb(null))
  mockFS.writeFile.mockImplementation((p, data, cb) => cb(null))

  // run
  const OUTPUT_FULL_PATH = path.resolve('./test/fixtures/locales')
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-service-provider \
      --conf=./test/fixtures/conf/l10n-service-provider-conf.json \
      --output=./test/fixtures/locales`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockFS.mkdir.mock.calls[0][0]).toEqual(OUTPUT_FULL_PATH)
  expect(mockFS.mkdir.mock.calls[0][1]).toEqual({ recursive: true })
})

test('--normalize option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({ ja: {}, en: {}}))

  // run
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --normalize=hierarchy`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPull).toHaveBeenCalledWith({
    locales: [],
    format: 'json',
    dryRun: false,
    normalize: 'hierarchy'
  })
})

test('--format option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({ ja: {}, en: {}}))

  // run
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --format=xliff`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPull).toHaveBeenCalledWith({
    locales: [],
    format: 'xliff',
    dryRun: false,
    normalize: undefined
  })
})

test('--providerArgs option', async () => {
  // setup mocks
  mockPull.mockImplementation(({ locales }) => Promise.resolve({ ja: {}, en: {}}))

  // run
  const pull = await import('../../src/commands/pull')
  const cmd = yargs.command(pull)
  await new Promise((resolve, reject) => {
    cmd.parse(`pull --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --providerArgs=arg1=1&arg2=2`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPull).toHaveBeenCalledWith({
    locales: [],
    format: 'json',
    dryRun: false,
    normalize: undefined,
    providerArgs: Object({
      arg1: '1',
      arg2: '2'
    })
  })
})
