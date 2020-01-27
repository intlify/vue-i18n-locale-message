import { ExitCode } from './exitcode'
import defineFail from './fail'

export class TranslationStatusError extends Error {}
export const fail = defineFail(TranslationStatusError, ExitCode.NotYetTranslation)

export default {
  TranslationStatusError,
  fail
}
