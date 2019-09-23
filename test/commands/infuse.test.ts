import * as yargs from 'yargs'
import jsonMetaInfo from '../fixtures/meta/json'
import json from '../fixtures/squeeze'
import path from 'path'

// -------
// mocking

const TARGET_PATH = '/path/to/project1'
const SFC_FILES = [
  `${TARGET_PATH}/src/App.vue`,
  `${TARGET_PATH}/src/components/Modal.vue`,
  `${TARGET_PATH}/src/components/nest/RankingTable.vue`,
  `${TARGET_PATH}/src/pages/Login.vue`
]
const LOCALE_FILES = [
  `${TARGET_PATH}/src/locales/ja.json`,
  `${TARGET_PATH}/src/locales/en.json`
]
const MOCK_FILES = SFC_FILES.reduce((files, file) => {
  const meta = jsonMetaInfo.find(meta => meta.contentPath === file)
  return Object.assign(files, { [file]: meta.raw })
}, {})

let orgCwd // for process.cwd mock

// mock: ../../src/utils
jest.mock('../../src/utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/utils'),
  resolve: jest.fn()
}))
import * as utils from '../../src/utils'

// mock: fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}))
import fs from 'fs'

// mock: glob
jest.mock('glob', () => ({ sync: jest.fn((pattern) => {
  if (`${TARGET_PATH}/src/locales/*.json` === pattern) {
    return LOCALE_FILES
  } else {
    return SFC_FILES
  }
}) }))

// -------------------
// setup/teadown hooks

beforeEach(() => {
  orgCwd = process.cwd
  process.cwd = jest.fn(() => TARGET_PATH) // mock: process.cwd
})

afterEach(() => {
  jest.clearAllMocks()
  process.cwd = orgCwd
})

// ----------
// test cases

test('absolute path', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve.mockImplementation((...paths) => paths[0])
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.readFileSync.mockImplementation(path => {
    if (MOCK_FILES[path as string]) {
      return MOCK_FILES[path as string]
    } else {
      return JSON.stringify(json)
    }
  })
  mockFS.writeFileSync.mockImplementation((path, data) => {
    writeFiles[path as string] = data.toString()
  })

  // run
  const infuse = await import('../../src/commands/infuse')
  const cmd = yargs.command(infuse)
  const output = await new Promise(resolve => {
    cmd.parse(`infuse --target=${TARGET_PATH}/src --locales=${TARGET_PATH}/locales.json`, () => {
      resolve(writeFiles)
    })
  })

  // check
  for (const [key, value] of Object.entries(output)) {
    expect(value).toMatchSnapshot(key)
  }
})

test('relative path', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => `${TARGET_PATH}/${paths[0]}`)
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.readFileSync.mockImplementation(path => {
    if (MOCK_FILES[path as string]) {
      return MOCK_FILES[path as string]
    } else {
      return JSON.stringify(json)
    }
  })
  mockFS.writeFileSync.mockImplementation((path, data) => {
    writeFiles[path as string] = data.toString()
  })

  // run
  const infuse = await import('../../src/commands/infuse')
  const cmd = yargs.command(infuse)
  const output = await new Promise(resolve => {
    cmd.parse(`infuse --target=./src --locales=locales-2.json`, () => {
      resolve(writeFiles)
    })
  })

  // check
  for (const [key, value] of Object.entries(output)) {
    expect(value).toMatchSnapshot(key)
  }
})

test('match option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => `${TARGET_PATH}/${paths[0]}`)
  const writeFiles = {}
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.readFileSync.mockImplementation(p => {
    if (MOCK_FILES[p as string]) {
      return MOCK_FILES[p as string]
    } else {
      return JSON.stringify(json[path.basename(p as string, '.json')])
    }
  })
  mockFS.writeFileSync.mockImplementation((path, data) => {
    writeFiles[path as string] = data.toString()
  })

  // run
  const infuse = await import('../../src/commands/infuse')
  const cmd = yargs.command(infuse)
  const output = await new Promise(resolve => {
    cmd.parse(`infuse --target=./src --locales=./src/locales --match=^([\\w-]*)\\.json`, () => {
      resolve(writeFiles)
    })
  })

  // check
  for (const [key, value] of Object.entries(output)) {
    expect(value).toMatchSnapshot(key)
  }
})
