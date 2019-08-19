import * as yargs from 'yargs'
import squeeze from '../src/commands/squeeze'
import infuse from '../src/commands/infuse'

let orgCwd
beforeEach(async () => {
  orgCwd = process.cwd
  process.cwd = jest.fn(() => '/path/to/project1')
})

afterEach(() => {
  jest.clearAllMocks()
  process.cwd = orgCwd
})

test('top output help', async () => {
  const cmd = yargs
    .usage('Usage: $0 <command> [options]')
    .command(squeeze)
    .command(infuse)
    .demandCommand()
    .locale('en')
    .help()
  const output = await new Promise(resolve => {
    // eslint-disable-next-line handle-callback-err
    cmd.parse('--help', (err, argv, output) => {
      resolve(output)
    })
  })

  expect(output).toMatchSnapshot()
})

test('squeeze command output help', async () => {
  const cmd = yargs
    .command(squeeze)
    .locale('en')
    .help()
  const output = await new Promise(resolve => {
    // eslint-disable-next-line handle-callback-err
    cmd.parse('squeeze --help', (err, argv, output) => {
      resolve(output)
    })
  })

  expect(output).toMatchSnapshot()
})

test('infuse command output help', async () => {
  const cmd = yargs
    .command(infuse)
    .locale('en')
    .help()
  const output = await new Promise(resolve => {
    // eslint-disable-next-line handle-callback-err
    cmd.parse('infuse --help', (err, argv, output) => {
      resolve(output)
    })
  })

  expect(output).toMatchSnapshot()
})
