import he from 'he';

export default class Dictionary {
  /**
   * Fill dictionary with translations.
   * @param {object} translation Translations.
   */
  static fill(translation) {
    Dictionary.translation = Dictionary.sanitize(translation);
  }

  /**
   * Get translation for a key.
   * @param {string} key Key to look for.
   * @return {string} Translation.
   */
  static get(key) {
    return Dictionary.translation[key];
  }

  /**
   * Sanitize translations recursively: HTML decode and strip HTML.
   */
  static sanitize(translation) {
    if (typeof translation === 'object') {
      for (let key in translation) {
        translation[key] = Dictionary.sanitize(translation[key]);
      }
    }
    else if (typeof translation === 'string') {
      translation = he.decode(translation);
      const div = document.createElement('div');
      div.innerHTML = translation;
      translation = div.textContent || div.innerText || '';
    }
    else {
      // Invalid translation
    }

    return translation;
  }
}
