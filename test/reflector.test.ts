import { SFCFileInfo } from '../types'
import files from './fixtures/meta'
import jsonMetaInfo from './fixtures/format/json'
import reflectSFCDescriptor from '../src/reflector'

test('reflectSFCDescriptor', () => {
  const descriptors = reflectSFCDescriptor('/path/to/project1/src', files as SFCFileInfo[])
  expect(descriptors[0].contentPath).toEqual(jsonMetaInfo[0].contentPath)
  expect(descriptors[0].component).toEqual(jsonMetaInfo[0].component)
  expect(descriptors[0].hierarchy).toEqual(jsonMetaInfo[0].hierarchy)
})
