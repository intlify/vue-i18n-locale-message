import { SFCFileInfo } from '../types'

import infuse from '../src/infuser'
import squeeze from '../src/squeezer'
import jsonFiles from './fixtures/file/json'
import yamlFiles from './fixtures/file/yaml'
import json5Files from './fixtures/file/json5'

const basePath = '/path/to/project1/src'

test('json', () => {
  const messages = squeeze(basePath, jsonFiles as SFCFileInfo[])

  // edit locale messages (e.g. translator)
  Object.assign(messages['en'], {
    pages: {
      'Login': {
        id: 'User ID',
        password: 'Password',
        confirm: 'Confirm Password',
        button: 'Login'
      }
    }
  })
  Object.assign(messages['ja']['components'], {
    nest: {
      'RankingTable': {
        headers: {
          rank: 'ランク',
          name: '名前',
          score: 'スコア'
        }
      }
    }
  })

  const outputFiles = infuse(basePath, jsonFiles, messages)
  outputFiles.forEach(file => expect(file.content).toMatchSnapshot(file.path))
})

test('yaml', () => {
  const messages = squeeze(basePath, yamlFiles as SFCFileInfo[])

  // edit locale messages (e.g. translator)
  Object.assign(messages['en'], {
    pages: {
      'Login': {
        id: 'User ID',
        password: 'Password',
        confirm: 'Confirm Password',
        button: 'Login'
      }
    }
  })
  Object.assign(messages['ja']['components'], {
    nest: {
      'RankingTable': {
        headers: {
          rank: 'ランク',
          name: '名前',
          score: 'スコア'
        }
      }
    }
  })

  const outputFiles = infuse(basePath, yamlFiles, messages)
  outputFiles.forEach(file => expect(file.content).toMatchSnapshot(file.path))
})

test('json5', () => {
  const messages = squeeze(basePath, json5Files as SFCFileInfo[])

  // edit locale messages (e.g. translator)
  Object.assign(messages['en'], {
    pages: {
      'Login': {
        id: 'User ID',
        password: 'Password',
        confirm: 'Confirm Password',
        button: 'Login'
      }
    }
  })
  Object.assign(messages['ja']['components'], {
    nest: {
      'RankingTable': {
        headers: {
          rank: 'ランク',
          name: '名前',
          score: 'スコア'
        }
      }
    }
  })

  const outputFiles = infuse(basePath, json5Files, messages)
  outputFiles.forEach(file => expect(file.content).toMatchSnapshot(file.path))
})  
