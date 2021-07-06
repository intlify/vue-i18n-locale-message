import * as yargs from 'yargs'
import deepmerge from 'deepmerge'
import path from 'path'

import jsonMetaInfo from '../fixtures/meta/json'
import json from '../fixtures/squeeze'
import external from '../fixtures/external'

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
const MOCK_IGNORE_FILES = '**/Login.vue'

let orgCwd // for process.cwd mock

// mock: ../../src/utils
jest.mock('../../src/utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/utils'),
  loadNamespaceDictionary: jest.fn(),
  splitLocaleMessages: jest.fn(),
  resolve: jest.fn()
}))
import * as utils from '../../src/utils'

// mock: fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockImplementation(path => true)
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
  mockUtils.loadNamespaceDictionary.mockImplementation(async () => ({}))
  mockUtils.splitLocaleMessages.mockImplementation((messages) => ({ sfc: messages }))
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
  mockUtils.loadNamespaceDictionary.mockImplementation(async () => ({}))
  mockUtils.splitLocaleMessages.mockImplementation((messages) => ({ sfc: messages }))
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

test('dryRun option', async () => {
  // setup mock'
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => `${TARGET_PATH}/${paths[0]}`)
  mockUtils.loadNamespaceDictionary.mockImplementation(async () => ({}))
  mockUtils.splitLocaleMessages.mockImplementation((messages) => ({ sfc: messages }))
  const mockFS = fs as jest.Mocked<typeof fs>
  mockFS.readFileSync.mockImplementation(path => {
    if (MOCK_FILES[path as string]) {
      return MOCK_FILES[path as string]
    } else {
      return JSON.stringify(json)
    }
  })

  // run
  const infuse = await import('../../src/commands/infuse')
  const cmd = yargs.command(infuse)
  await new Promise(resolve => {
    cmd.parse(`infuse --target=./src --locales=locales-2.json --dry-run`, () => {
      resolve()
    })
  })

  // check
  expect(mockFS.writeFileSync).not.toHaveBeenCalled()
})

test('match option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => `${TARGET_PATH}/${paths[0]}`)
  mockUtils.loadNamespaceDictionary.mockImplementation(async () => ({}))
  mockUtils.splitLocaleMessages.mockImplementation((messages) => ({ sfc: messages }))
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

test('bundle option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => `${TARGET_PATH}/${paths[0]}`)
  mockUtils.loadNamespaceDictionary.mockImplementation(async () => ({
    './test/fixtures/packages/package1/locales/**/*.json': 'package1',
    './test/fixtures/packages/package2/locales/**/*.json': 'package2'
  }))
  mockUtils.splitLocaleMessages.mockImplementation((messages) => ({
    sfc: deepmerge(messages, external),
    external: [{
      path: './test/fixtures/packages/package1/locales/en/common.json',
      messages: {
        package1: { common: { navigation: { title: 'title' }}}
      }
    }, {
      path: './test/fixtures/packages/package1/locales/ja/common.json',
      messages: {
        package1: { common: { navigation: { title: 'タイトル' }}}
      }
    }, {
      path: './test/fixtures/packages/package2/locales/en/profile.json',
      messages: {
        package2: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          profile: { display_name: 'Display Name', email: 'E-Mail' }
        }
      }
    }, {
      path: './test/fixtures/packages/package2/locales/ja/profile.json',
      messages: {
        package2: { profile: {}}
      }
    }]
  }))
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
    cmd.parse(`infuse --target=./src --locales=./src/locales --match=^([\\w-]*)\\.json \
      --unbundleTo=./test/fixtures/packages/package1/locales/**/*.json,./test/fixtures/packages/package2/locales/**/*.json \
      --unbundleMatch=([\\w]*)/([\\w]*)\\.json$ \
      --namespace=./test/fixtures/namespace.json`, () => {
      resolve(writeFiles)
    })
  })

  expect(output).toMatchSnapshot()
})

test('ignore option', async () => {
  // setup mocks
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve.mockImplementation((...paths) => paths[0])
  mockUtils.loadNamespaceDictionary.mockImplementation(async () => ({}))
  mockUtils.splitLocaleMessages.mockImplementation((messages) => ({ sfc: messages }))
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
  mockFS.readFileSync.mockImplementationOnce(path => MOCK_IGNORE_FILES);

  // run
  const infuse = await import('../../src/commands/infuse')
  const cmd = yargs.command(infuse)
  const output = await new Promise(resolve => {
    cmd.parse(`infuse --target=${TARGET_PATH}/src --locales=${TARGET_PATH}/locales.json --ignorePath=./test/fixtures/.ignore-i18n`, () => {
      resolve(writeFiles)
    })
  })

  // check
  for (const [key, value] of Object.entries(output)) {
    expect(value).toMatchSnapshot(key)
  }
})
