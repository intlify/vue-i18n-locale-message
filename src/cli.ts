#!/usr/bin/env node

import * as yargs from 'yargs'

yargs
  .usage('Usage: $0 <command> [options]')
  .commandDir('./commands', {
    extensions: process.env.NODE_ENV === 'development' ? ['js', 'ts'] : ['js']
  })
  .demandCommand()
  .help()
  .version()
  .argv

process.on('uncaughtException', err => {
  console.error(`uncaught exception: ${err}\n`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  console.error('unhandled rejection at:', p, 'reason:', reason)
  process.exit(1)
})
