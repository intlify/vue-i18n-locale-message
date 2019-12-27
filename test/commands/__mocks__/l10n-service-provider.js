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
}

module.exports = L10nServiceProvider
