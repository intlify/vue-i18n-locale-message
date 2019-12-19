import * as yargs from 'yargs'
import * as path from 'path'

// -------
// mocking

const mockPush = jest.fn()
jest.mock('@scope/l10n-service-provider', () => {
  return jest.fn().mockImplementation(() => {
    return { push: mockPush }
  })
})
import L10nServiceProvider from '@scope/l10n-service-provider'

// -------------------
// setup/teadown hooks

let spyLog
let spyError
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log')
  spyError = jest.spyOn(global.console, 'error')
})

afterEach(() => {
  spyError.mockRestore()
  spyLog.mockRestore()
  jest.clearAllMocks()
})

// ----------
// test cases

test('require option', async () => {
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
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
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=./404-provider.js`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
  expect(spyLog).toHaveBeenCalledWith('Not found ./404-provider.js provider')
})

test('not specified --target and --targetPaths', async () => {
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=l10n-service-provider`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })
  expect(spyLog).toHaveBeenCalledWith('You need to specify either --target or --target-paths')
})

test('--target option', async () => {
  // setup mocks
  mockPush.mockImplementation(resource => true)

  // run
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=@scope/l10n-service-provider --target=./test/fixtures/locales/en.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPush).toHaveBeenCalledWith({
    messages: {
      en: { hello: 'world' }
    },
    mode: 'locale-message'
  }, false)
})

test('--locale option', async () => {
  // setup mocks
  mockPush.mockImplementation(resource => true)

  // run
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=@scope/l10n-service-provider --target=./test/fixtures/locales/lang.json --locale=ja`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPush).toHaveBeenCalledWith({
    messages: {
      ja: { hello: '世界' }
    },
    mode: 'locale-message'
  }, false)
})

test('--conf option', async () => {
  // setup mocks
  mockPush.mockImplementation(reosurce => true)

  // run
  const TARGET_LOCALE = './test/fixtures/locales/en.json'
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=@scope/l10n-service-provider --conf=./test/fixtures/conf/l10n-service-provider-conf.json --target=${TARGET_LOCALE}`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(L10nServiceProvider).toHaveBeenCalledWith({
    provider: { token: 'xxx' },
    pushMode: 'file-path'
  })
  expect(mockPush).toHaveBeenCalledWith({
    files: [{
      locale: 'en',
      path: path.resolve(TARGET_LOCALE)
    }],
    mode: 'file-path'
  }, false)
})

test('--target-paths option', async () => {
  // setup mocks
  mockPush.mockImplementation(resource => true)

  // run
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=@scope/l10n-service-provider --target-paths=./test/fixtures/locales/*.json --filename-match=^([\\w]*)\\.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPush).toHaveBeenCalledWith({
    messages: {
      en: {
        hello: 'world'
      },
      lang: {
        hello: '世界'
      },
      ja: {
        hello: 'こんにちわわわ！',
        world: 'ザ・ワールド'
      }
    },
    mode: 'locale-message'
  }, false)
})

test('not specified --filename-match', async () => {
  // setup mocks
  mockPush.mockImplementation(resource => true)

  // run
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=@scope/l10n-service-provider --target-paths=./test/fixtures/locales/*.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(spyLog).toHaveBeenCalledWith('You need to specify together --filename-match')
})

test('--dry-run option', async () => {
  // setup mocks
  mockPush.mockImplementation(resource => false)

  // run
  const push = await import('../../src/commands/push')
  const cmd = yargs.command(push)
  await new Promise((resolve, reject) => {
    cmd.parse(`push --provider=@scope/l10n-service-provider --target=./test/fixtures/locales/lang.json --locale=ja --dryRun`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(mockPush).toHaveBeenCalledWith({
    messages: {
      ja: { hello: '世界' }
    },
    mode: 'locale-message'
  }, true)
})
