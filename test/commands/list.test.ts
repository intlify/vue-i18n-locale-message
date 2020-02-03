import * as path from 'path'
import { flash, runCommand } from '../helper'

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

jest.mock('../../src/commands/fails/list', () => ({
  ...jest.requireActual('../../src/commands/fails/list'),
  fail: jest.fn()
}))
import listFail from '../../src/commands/fails/list'

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
  // mocking ...
  const mockListFail = listFail as jest.Mocked<typeof listFail>
  mockListFail.fail.mockImplementation(() => {})

  // run
  await runCommand('src/commands/list', `list`)
  await flash()

  // verify
  expect(mockListFail.fail).toHaveBeenCalled()
})

test('not specified --target and --target-paths', async () => {
  // mocking ...
  const mockListFail = listFail as jest.Mocked<typeof listFail>
  mockListFail.fail.mockImplementation(() => {})

  // run
  await runCommand('src/commands/list', `list --locale=en`)
  await flash()

  // verify
  expect(mockListFail.fail.mock.calls[0][1].message).toEqual('You need to specify either --target or --target-paths')
})

test('--target option', async () => {
  // mocking ...
  const mockListFail = listFail as jest.Mocked<typeof listFail>
  mockListFail.fail.mockImplementation(() => {})
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
  await runCommand('src/commands/list', `list --locale=en --target=./test/fixtures/locales/ja.json`)
  await flash()

  expect(spyLog).toHaveBeenCalledTimes(2)
  expect(spyLog.mock.calls[0]).toEqual([`ja: 'foo' undefined`])
  expect(spyLog.mock.calls[1]).toEqual([`ja: 'bar.buz' undefined`])
  expect(mockFS.writeFile).not.toHaveBeenCalled()
  expect(mockListFail.fail.mock.calls[0][1].message).toEqual('There are undefined fields in the target locale messages, you can define with --define option')
})

test('--target-paths option', async () => {
  // mocking ...
  const mockListFail = listFail as jest.Mocked<typeof listFail>
  mockListFail.fail.mockImplementation(() => {})
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
  await runCommand(
    'src/commands/list',
    `list --locale=en --target=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json`
  )
  await flash()

  // verify
  expect(spyLog).toHaveBeenCalledTimes(2)
  expect(spyLog.mock.calls[0]).toEqual([`ja: 'foo' undefined`])
  expect(spyLog.mock.calls[1]).toEqual([`ja: 'bar.buz' undefined`])
  expect(mockFS.writeFile).not.toHaveBeenCalled()
  expect(mockListFail.fail.mock.calls[0][1].message).toEqual('There are undefined fields in the target locale messages, you can define with --define option')
})

test('--define option', async () => {
  // mocking ...
  const mockListFail = listFail as jest.Mocked<typeof listFail>
  mockListFail.fail.mockImplementation(() => {})
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.getLocaleMessages.mockImplementation((...args) => ({
    en: {
      foo: 'foo',
      bar: { buz: 'buz' },
      buz: {
        inedexed: { '1': 'low', '10': 'middle', '20': 'high' }
      }
    },
    ja: {}
  }))
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.writeFile.mockImplementation((p, data) => {
    writeFiles[path.basename(p as string)] = data
  })

  // run
  await runCommand(
    'src/commands/list',
    `list --locale=en \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json \
      --define`
  )
  await flash()

  // verify
  expect(spyLog).toHaveBeenCalledTimes(6)
  expect(spyLog.mock.calls[0]).toEqual([`ja: 'foo' undefined`])
  expect(spyLog.mock.calls[1]).toEqual([`ja: 'bar.buz' undefined`])
  expect(spyLog.mock.calls[2]).toEqual([`ja: 'buz.inedexed.1' undefined`])
  expect(spyLog.mock.calls[3]).toEqual([`ja: 'buz.inedexed.10' undefined`])
  expect(spyLog.mock.calls[4]).toEqual([`ja: 'buz.inedexed.20' undefined`])
  expect(JSON.parse(writeFiles['ja.json'])).toEqual({
    foo: '',
    bar: { buz: '' },
    buz: {
      inedexed: { '1': '', '10': '', '20': '' }
    }
  })
})

test('--indent option', async () => {
  // mocking ...
  const mockListFail = listFail as jest.Mocked<typeof listFail>
  mockListFail.fail.mockImplementation(() => {})
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
  await runCommand(
    'src/commands/list',
    `list --locale=en \
      --target-paths=./test/fixtures/locales/*.json \
      --filename-match=^([\\w]*)\\.json \
      --define --indent=4`
  )
  await flash()

  expect(writeFiles).toMatchSnapshot()
})
