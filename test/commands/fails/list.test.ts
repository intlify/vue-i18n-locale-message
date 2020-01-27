import { ExitCode } from '../../../src/commands/fails/exitcode'
import { LocaleMessageUndefindError, fail } from '../../../src/commands/fails/list'

// -------
// mocking

// -------------------
// setup/teadown hooks

let orgExit // for process.exit mock
let spyWarn
let spyError
beforeEach(() => {
  spyWarn = jest.spyOn(global.console, 'warn')
  spyError = jest.spyOn(global.console, 'error')
  process.exit = jest.fn((code => { return 'exit!' as never })) // mock: process.exit
})

afterEach(() => {
  spyError.mockRestore()
  spyWarn.mockRestore()
  jest.clearAllMocks()
  process.exit = orgExit
})

// ----------
// test cases

test('msg params', () => {
  fail('This is an error message', null)
  expect(spyError).toHaveBeenCalledWith('This is an error message')
  expect(process.exit).toHaveBeenCalledWith(1)
})

test('err params: TranslationStatusError', () => {
  fail(null, new LocaleMessageUndefindError('This is a LocaleMessageUndefindError'))
  expect(spyWarn).toHaveBeenCalledWith('This is a LocaleMessageUndefindError')
  expect(process.exit).toHaveBeenCalledWith(ExitCode.UndefinedLocaleMessage)
})

test('err params: other general error', () => {
  expect.assertions(1)

  const err = new Error('This is an general error')
  try {
    fail(null, err)
  } catch (e) {
    expect(e).toEqual(err)
  }
})
