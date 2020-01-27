import { ExitCode } from './exitcode'
import defineFail from './fail'

export class DiffError extends Error {}
export const fail = defineFail(DiffError, ExitCode.Difference)

export default {
  DiffError,
  fail
}
