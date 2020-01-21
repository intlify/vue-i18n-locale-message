import * as yargs from 'yargs'
import * as path from 'path'

// -------
// mocking

// mock: ../../src/utils
jest.mock('../../src/utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/utils'),
  getLocaleMessages: jest.fn()
}))
import * as utils from '../../src/utils'

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFile: jest.fn()
}))
import fs from 'fs'

// -------------------
// setup/teadown hooks

let orgExit // for process.exit mock
let spyLog
let spyError
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log')
  spyError = jest.spyOn(global.console, 'error')
  process.exit = jest.fn((code => { return 'exit!' as never })) // mock: process.exit
})

afterEach(() => {
  spyError.mockRestore()
  spyLog.mockRestore()
  jest.clearAllMocks()
  process.exit = orgExit
})

// ----------
// test cases

test('require option', async () => {
  const list = await import('../../src/commands/list')
  const cmd = yargs.command(list)
  try {
    await new Promise((resolve, reject) => {
      cmd.parse(`list`, (err, argv, output) => {
        err ? reject(err) : resolve(output)
      })
    })
  } catch (e) {
    expect(e).toMatchObject({ name: 'YError' })
  }
})

test('not specified --target and --targetPaths', async () => {
  // run
  const list = await import('../../src/commands/list')
  const cmd = yargs.command(list)
  await new Promise((resolve, reject) => {
    cmd.parse(`list --locale=en`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  // verify
  expect(spyError).toHaveBeenCalledWith('You need to specify either --target or --target-paths')
})

test('--target option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.getLocaleMessages.mockImplementation((...args) => ({
    en: {
      foo: 'foo',
      bar: { buz: 'buz' }
    },
    ja: {}
  }))
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.writeFile.mockImplementation((path, data) => {
    writeFiles[path as string] = data
  })

  // run
  const list = await import('../../src/commands/list')
  const cmd = yargs.command(list)
  await new Promise((resolve, reject) => {
    cmd.parse(`list --locale=en --target=./test/fixtures/locales/ja.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(spyLog).toHaveBeenCalledTimes(2)
  expect(spyLog.mock.calls[0]).toEqual([`ja: 'foo' undefined`])
  expect(spyLog.mock.calls[1]).toEqual([`ja: 'bar.buz' undefined`])
  expect(mockFS.writeFile).not.toHaveBeenCalled()
  // NOTE: cannot detect process.exit calling ...
  // expect(process.exit).toHaveBeenCalledWith(5)
})

test('--target-paths option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.getLocaleMessages.mockImplementation((...args) => ({
    en: {
      foo: 'foo',
      bar: { buz: 'buz' }
    },
    ja: {}
  }))
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.writeFile.mockImplementation((path, data) => {
    writeFiles[path as string] = data
  })

  // run
  const list = await import('../../src/commands/list')
  const cmd = yargs.command(list)
  await new Promise((resolve, reject) => {
    cmd.parse(`list --locale=en \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(spyLog).toHaveBeenCalledTimes(2)
  expect(spyLog.mock.calls[0]).toEqual([`ja: 'foo' undefined`])
  expect(spyLog.mock.calls[1]).toEqual([`ja: 'bar.buz' undefined`])
  expect(mockFS.writeFile).not.toHaveBeenCalled()
  // NOTE: cannot detect process.exit calling ...
  // expect(process.exit).toHaveBeenCalledWith(5)
})

test('--define option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.getLocaleMessages.mockImplementation((...args) => ({
    en: {
      foo: 'foo',
      bar: { buz: 'buz' }
    },
    ja: {}
  }))
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.writeFile.mockImplementation((p, data) => {
    writeFiles[path.basename(p as string)] = data
  })

  // run
  const list = await import('../../src/commands/list')
  const cmd = yargs.command(list)
  await new Promise((resolve, reject) => {
    cmd.parse(`list --locale=en \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json \
      --define`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(spyLog).toHaveBeenCalledTimes(3)
  expect(spyLog.mock.calls[0]).toEqual([`ja: 'foo' undefined`])
  expect(spyLog.mock.calls[1]).toEqual([`ja: 'bar.buz' undefined`])
  expect(JSON.parse(writeFiles['ja.json'])).toEqual({
    foo: '',
    bar: { buz: '' }
  })
})

test('--indent option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.getLocaleMessages.mockImplementation((...args) => ({
    en: {
      foo: 'foo',
      bar: { buz: 'buz' }
    },
    ja: {}
  }))
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.writeFile.mockImplementation((p, data) => {
    writeFiles[path.basename(p as string)] = data
  })

  // run
  const list = await import('../../src/commands/list')
  const cmd = yargs.command(list)
  await new Promise((resolve, reject) => {
    cmd.parse(`list --locale=en \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json \
      --define --indent=4`, (err, argv, output) => {
      err ? reject(err) : resolve(output)
    })
  })

  expect(writeFiles).toMatchSnapshot()
})
