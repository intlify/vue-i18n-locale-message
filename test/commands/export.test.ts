import * as yargs from 'yargs'
import * as path from 'path'

// ------
// mocks

// l10n service provider module
const mockExport = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { export: mockExport }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

jest.mock('@scope/l10n-omit-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return {
      export: jest.fn().mockImplementation((locales, format) => {
        const data = [{
          locale: 'en',
          data: Buffer.from(JSON.stringify({ hello: 'hello' }))
        }, {
          locale: 'ja',
          data: Buffer.from(JSON.stringify({ hello: 'こんにちわわわ！' }))
        }]
        return Promise.resolve(data)
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
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  try {
    await new Promise((resolve, reject) => {
      cmd.parse(`export`, (err, argv, output) => {
        err ? reject(err) : resolve(output)
      })
    })
  } catch (e) {
    expect(e).toMatchObject({ name: 'YError' })
  }
})

test('--provider: not found', async () => {
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=./404-provider.js \
      --output=./foo`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
  expect(spyLog).toHaveBeenCalledWith('Not found ./404-provider.js provider')
})

test('--conf option', async () => {
  // setup mocks
  const data = [
    { locale: 'ja', format: 'json', data: Buffer.from(JSON.stringify({})) },
    { locale: 'en', format: 'json', data: Buffer.from(JSON.stringify({})) }
  ]
  mockExport.mockImplementation(({ locales, format }) => Promise.resolve(data))

  // run
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=@scope/l10n-service-provider \
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
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=@scope/l10n-omit-service-provider \
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
  const data = [
    { locale: 'ja', format: 'json', data: Buffer.from(JSON.stringify({})) },
    { locale: 'en', format: 'json', data: Buffer.from(JSON.stringify({})) }
  ]
  mockExport.mockImplementation(({ locales, format }) => Promise.resolve(data))

  // run
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --locales=en,ja,fr \
      --dry-run`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockExport).toHaveBeenCalledWith({
    locales: ['en', 'ja', 'fr'],
    format: 'json',
    dryRun: true,
    normalize: undefined
  })
})

test('--output option', async () => {
  // setup mocks
  const data = [
    { locale: 'ja', format: 'json', data: Buffer.from(JSON.stringify({ hello: 'hello' })) },
    { locale: 'en', format: 'json', data: Buffer.from(JSON.stringify({ hello: 'こんにちわわわ！' })) }
  ]
  mockExport.mockImplementation(({ locales, format }) => Promise.resolve(data))
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.mkdir.mockImplementation((p, option, cb) => cb(null))
  mockFS.writeFile.mockImplementation((p, data, cb) => cb(null))

  // run
  const OUTPUT_FULL_PATH = path.resolve('./test/fixtures/locales')
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=@scope/l10n-service-provider \
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
  const data = [
    { locale: 'ja', format: 'json', data: Buffer.from(JSON.stringify({})) },
    { locale: 'en', format: 'json', data: Buffer.from(JSON.stringify({})) }
  ]
  mockExport.mockImplementation(({ locales, format }) => Promise.resolve(data))

  // run
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --normalize=hierarchy`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockExport).toHaveBeenCalledWith({
    locales: [],
    format: 'json',
    dryRun: false
  })
})

test('--format option', async () => {
  // setup mocks
  const data = [
    { locale: 'ja', format: 'xliff', data: Buffer.from(JSON.stringify({})) },
    { locale: 'en', format: 'xliff', data: Buffer.from(JSON.stringify({})) }
  ]
  mockExport.mockImplementation(({ locales, format }) => Promise.resolve(data))

  // run
  const exp = await import('../../src/commands/export')
  const cmd = yargs.command(exp)
  await new Promise((resolve, reject) => {
    cmd.parse(`export --provider=@scope/l10n-service-provider \
      --output=./test/fixtures/locales \
      --format=xliff`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockExport).toHaveBeenCalledWith({
    locales: [],
    format: 'xliff',
    dryRun: false,
    normalize: undefined
  })
})
