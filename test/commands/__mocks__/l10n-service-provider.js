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
}

module.exports = L10nServiceProvider
