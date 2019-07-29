import squeeze from '../src/squeezer'
import metaInfo from './fixtures/meta'
import { LocaleMessages, LocaleMessageMeta } from '../types'

test('squeeze', () => {
  const mesasges: LocaleMessages = squeeze(metaInfo as LocaleMessageMeta[])
  expect(mesasges).toMatchSnapshot()
})
