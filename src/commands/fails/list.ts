import { ExitCode } from './exitcode'
import defineFail from './fail'

export class LocaleMessageUndefindError extends Error {}
export const fail = defineFail(LocaleMessageUndefindError, ExitCode.UndefinedLocaleMessage)

export default {
  LocaleMessageUndefindError,
  fail
}
