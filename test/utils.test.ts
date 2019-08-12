import { SFCFileInfo } from '../types'

import jsonFiles from './fixtures/file/json'
import jsonMetaInfo from './fixtures/meta/json'
import { reflectSFCDescriptor } from '../src/utils'

test('reflectSFCDescriptor', () => {
  const descriptors = reflectSFCDescriptor('/path/to/project1/src', jsonFiles as SFCFileInfo[])
  expect(descriptors[0].contentPath).toEqual(jsonMetaInfo[0].contentPath)
  expect(descriptors[0].component).toEqual(jsonMetaInfo[0].component)
  expect(descriptors[0].hierarchy).toEqual(jsonMetaInfo[0].hierarchy)
})
