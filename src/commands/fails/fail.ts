import { ExitCode } from './exitcode'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = { new (...args: any[]): T }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typeGuard<T> (o: any, className: Constructor<T>): o is T {
  return o instanceof className
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function defineFail (UserError: any, code: ExitCode) {
  return (msg: string, err: Error) => {
    if (msg) {
      // TODO: should refactor console message
      console.error(msg)
      process.exit(1)
    } else {
      if (typeGuard(err, UserError)) {
        // TODO: should refactor console message
        console.warn(err.message)
        process.exit(code)
      } else {
        // preserve statck! see the https://github.com/yargs/yargs/blob/master/docs/api.md#failfn
        throw err
      }
    }
  }
}
