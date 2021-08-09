export default class Dictionary {
  /**
   * Fill dictionary with translations.
   * @param {object} translation Translations.
   */
  static fill(translation) {
    Dictionary.translation = translation;
  }

  /**
   * Get translation for a key.
   * @param {string} key Key to look for.
   * @return {string} Translation.
   */
  static get(key) {
    return Dictionary.translation[key];
  }
}
