import * as yargs from 'yargs'
import * as path from 'path'
import * as fs from 'fs'

// -------
// mocking

const mockImport = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { import: mockImport }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

jest.mock('@scope/l10n-omit-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { import: jest.fn() }
  })
})
import L10nOmitServiceProvider from '@scope/l10n-omit-service-provider'

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
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  try {
    await new Promise((resolve, reject) => {
      cmd.parse(`import`, (err, argv, output) => {
        err ? reject(err) : resolve(output)
      })
    })
  } catch (e) {
    expect(e).toMatchObject({ name: 'YError' })
  }
})

test('--provider: not found', async () => {
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=./404-provider.js`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
  expect(spyLog).toHaveBeenCalledWith('Not found ./404-provider.js provider')
})

test('not specified --target and --targetPaths', async () => {
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=l10n-service-provider`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
  expect(spyLog).toHaveBeenCalledWith('You need to specify either --target or --target-paths')
})

test('--target option', async () => {
  // setup mocks
  mockImport.mockImplementation(({ resource }) => Promise.resolve())

  // run
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-service-provider \
      --target=./test/fixtures/locales/en.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockImport).toHaveBeenCalledWith({
    messages: [{
      locale: 'en',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/en.json')
    }],
    dryRun: false,
    normalize: undefined
  })
})

test('--locale option', async () => {
  // setup mocks
  mockImport.mockImplementation(({ resource }) => Promise.resolve())

  // run
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-service-provider \
      --target=./test/fixtures/locales/lang.json --locale=ja`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockImport).toHaveBeenCalledWith({
    messages: [{
      locale: 'ja',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/lang.json')
    }],
    dryRun: false,
    normalize: undefined
  })
})

test('--conf option', async () => {
  // setup mocks
  mockImport.mockImplementation(({ reosurce }) => Promise.resolve())

  // run
  const TARGET_LOCALE = './test/fixtures/locales/en.json'
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-service-provider \
      --conf=./test/fixtures/conf/l10n-service-provider-conf.json \
      --target=${TARGET_LOCALE}`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(L10nServiceProvider).toHaveBeenCalledWith({
    provider: { token: 'xxx' }
  })
  expect(mockImport).toHaveBeenCalledWith({
    messages: [{
      locale: 'en',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/en.json')
    }],
    dryRun: false,
    normalize: undefined
  })
})

test('--conf option omit', async () => {
  // run
  const TARGET_LOCALE = './test/fixtures/locales/en.json'
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-omit-service-provider \
      --target=${TARGET_LOCALE}`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(L10nOmitServiceProvider).toHaveBeenCalledWith({
    provider: { token: 'yyy' }
  })
})

test('--target-paths option', async () => {
  // setup mocks
  mockImport.mockImplementation(({ reosurce }) => Promise.resolve())

  // run
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-service-provider \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockImport).toHaveBeenCalledWith({
    messages: [{
      locale: 'en',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/en.json')
    }, {
      locale: 'ja',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/ja.json')
    }, {
      locale: 'lang',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/lang.json')
    }],
    dryRun: false,
    normalize: undefined
  })
})

test('not specified --filename-match', async () => {
  // setup mocks
  mockImport.mockImplementation(({ reosurce }) => Promise.resolve())

  // run
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-service-provider \
      --target-paths=./test/fixtures/locales/*.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(spyError).toHaveBeenCalledWith('import fail:', 'You need to specify together --filename-match')
})

test('--dry-run option', async () => {
  // setup mocks
  mockImport.mockImplementation(({ reosurce }) => Promise.resolve())

  // run
  const imp = await import('../../src/commands/import')
  const cmd = yargs.command(imp)
  await new Promise((resolve, reject) => {
    cmd.parse(`import --provider=@scope/l10n-service-provider \
      --target=./test/fixtures/locales/lang.json --locale=ja --dryRun`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockImport).toHaveBeenCalledWith({
    messages: [{
      locale: 'ja',
      format: 'json',
      data: fs.readFileSync('./test/fixtures/locales/lang.json')
    }],
    dryRun: true,
    normalize: undefined
  })
})
