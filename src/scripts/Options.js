export default class Options {
  static fill(options, contentId) {
    Options.options = options;
    Options.contentId = contentId;
  }

  static get(key) {
    return Options.options[key];
  }

  static contentId() {
    return Options.contentId;
  }

  static all() {
    return Options.options;
  }

  /**
   * Sanitize options.
   * @param {object} options Options to be sanizited.
   * @return {object} Sanitized options.
   */
  static sanitize(options) {
    // Filter out incomplete units
    options.units = options.units.filter(unit => unit.action);

    return options;
  }
}
