class L10nServiceProvider {
  constructor (options) {
    this._options = options
  }

  async push (messsages, dryRun) {
    return
  }

  async pull (locales, dryRun) {
    return Promise.resolve({ ja: {}, en: {}})
  }

  async status (locales, dryRun) {
    return Promise.resolve([{
      locale: 'en',
      percentable: 100.0
    }])
  }

  async import (messsages, dryRun) {
    return
  }

  async export (locales, format, dryRun) {
    const data = [{
      locale: 'ja',
      data: Buffer.from(JSON.stringify({}))
    }, {
      locale: 'en',
      data: Buffer.from(JSON.stringify({}))
    }]
    return Promise.resolve(data)
  }
}

module.exports = L10nServiceProvider
