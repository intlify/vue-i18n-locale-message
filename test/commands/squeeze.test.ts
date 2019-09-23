import * as yargs from 'yargs'
import jsonMetaInfo from '../fixtures/meta/json'

// -------
// mocking

const TARGET_PATH = '/path/to/project1'
const SFC_FILES = [
  `${TARGET_PATH}/src/App.vue`,
  `${TARGET_PATH}/src/components/Modal.vue`,
  `${TARGET_PATH}/src/components/nest/RankingTable.vue`,
  `${TARGET_PATH}/src/pages/Login.vue`
]
const MOCK_FILES = SFC_FILES.reduce((files, file) => {
  const meta = jsonMetaInfo.find(meta => meta.contentPath === file)
  return Object.assign(files, { [file]: meta.raw })
}, {})
let writeFiles = {} // for fs mock
let orgCwd // for process.cwd mock

// mock: ../../src/utils
jest.mock('../../src/utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/utils'),
  resolve: jest.fn()
}))
import * as utils from '../../src/utils'

// mock: glob
jest.mock('glob', () => ({ sync: jest.fn(() => SFC_FILES) }))

// mock: fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn().mockImplementation(path => MOCK_FILES[path as string]),
  writeFileSync: jest.fn().mockImplementation((path, data) => {
    writeFiles[path as string] = data.toString()
  }),
  mkdirSync: jest.fn().mockImplementation(path => {})
}))

// -------------------
// setup/teadown hooks

beforeEach(() => {
  orgCwd = process.cwd
  process.cwd = jest.fn(() => TARGET_PATH) // mock: process.cwd
})

afterEach(() => {
  jest.clearAllMocks()
  process.cwd = orgCwd
  writeFiles = {}
})

// ----------
// test cases

test('absolute path', async () => {
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve.mockImplementation((...paths) => paths[0])

  const squeeze = await import('../../src/commands/squeeze')
  const cmd = yargs.command(squeeze)
  const output = await new Promise(resolve => {
    cmd.parse(`squeeze --target=${TARGET_PATH}/src --output=${TARGET_PATH}/locales.json`, () => {
      resolve(writeFiles)
    })
  })

  expect(output).toMatchSnapshot()
})

test('relative path', async () => {
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => `${TARGET_PATH}/${paths[0]}`)

  const squeeze = await import('../../src/commands/squeeze')
  const cmd = yargs.command(squeeze)
  const output = await new Promise(resolve => {
    cmd.parse('squeeze --target=./src --output=locales-1.json', () => {
      resolve(writeFiles)
    })
  })

  expect(output).toMatchSnapshot()
})

test('omitted output path', async () => {
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve
    .mockImplementationOnce(() => `${TARGET_PATH}/src`)
    .mockImplementationOnce((...paths) => paths[0])

  const squeeze = await import('../../src/commands/squeeze')
  const cmd = yargs.command(squeeze)
  await new Promise(resolve => {
    cmd.parse('squeeze --target=./src', () => {
      resolve(writeFiles)
    })
  })

  expect(mockUtils.resolve.mock.calls[1][0]).toBe(`${TARGET_PATH}/messages.json`)
})

test('split option', async () => {
  const mockUtils = utils as jest.Mocked<typeof utils>
  mockUtils.resolve.mockImplementation((...paths) => paths[0])

  const squeeze = await import('../../src/commands/squeeze')
  const cmd = yargs.command(squeeze)
  const output = await new Promise(resolve => {
    cmd.parse(`squeeze --target=${TARGET_PATH}/src --split --output=${TARGET_PATH}/locales`, () => {
      resolve(writeFiles)
    })
  })

  expect(output).toMatchSnapshot()
})
