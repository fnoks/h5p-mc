/** @const Default options */
const DEFAULT_OPTIONS = {
  layoutEngine: 'grid',
  units: [],
  behaviour: {
    retry: true,
    forceSequential: true
  },
  layout: {
    minimumWidth: 200,
    fullScreen: 'always',
    forceFullScreenWidthThreshold: 500,
    resultsPlacement: {
      default: 'left'
    }
  },
  theme: {
    backgroundColorUnits: '#fff',
    backgroundColorResults: '#1C1D21'
  },
  dictionary: {} // Sanitized in Dictionary class
};

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
    // Set defaults
    options = H5P.jQuery.extend(DEFAULT_OPTIONS, options);
  
    // Filter out incomplete units
    options.units = options.units.filter(unit => unit.action);

    return options;
  }
}
