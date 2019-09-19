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
  const login = messages['components']['/path/to/project1/src/pages/Login.vue']
  login.push({
    lang: 'json',
    locale: 'en',
    messages: {
      en: {
        id: 'User ID',
        password: 'Password',
        confirm: 'Confirm Password',
        button: 'Login'
      }
    }
  })
  const rankingTable = messages['components']['/path/to/project1/src/components/nest/RankingTable.vue']
  rankingTable.push({
    lang: 'json',
    locale: 'ja',
    messages: {
      ja: {
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
  const modal = messages['components']['/path/to/project1/src/components/Modal.vue']
  modal.push({
    lang: 'yaml',
    locale: 'en',
    messages: {
      en: {
        id: 'User ID',
        password: 'Password',
        confirm: 'Confirm Password',
        button: 'Login'
      }
    }
  })
  modal.push({
    lang: 'yml',
    locale: 'ja',
    messages: {
      ja: {
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
  const modal = messages['components']['/path/to/project1/src/components/Modal.vue']
  modal.push({
    lang: 'json5',
    locale: 'en',
    messages: {
      en: {
        id: 'User ID',
        password: 'Password',
        confirm: 'Confirm Password',
        button: 'Login'
      }
    }
  })
  modal.push({
    lang: 'json5',
    locale: 'ja',
    messages: {
      ja: {
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

test('not full localitation', () => {
  const messages = squeeze(basePath, jsonFiles as SFCFileInfo[])

  // edit locale messages 'ja' only (e.g. translator)
  const modal = messages['components']['/path/to/project1/src/components/Modal.vue']
  modal.push({
    lang: 'json5',
    locale: 'ja',
    messages: {
      ja: {
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
