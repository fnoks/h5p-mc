export default class Options {
  /**
   * Fill options with values.
   * @param {object} options Options.
   * @param {number} contentId Content id.
   */
  static fill(options, contentId) {
    Options.options = options;
    Options.contentId = contentId;
  }

  /**
   * Get particular option value.
   * @param {string} key Key to look for.
   * @return {*} Option value for key.
   */
  static get(key) {
    return Options.options[key];
  }

  /**
   * Return content id.
   * @return {number} Content id.
   */
  static contentId() {
    return Options.contentId;
  }

  /**
   * Get all options.
   * @return {object} All options.
   */
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
