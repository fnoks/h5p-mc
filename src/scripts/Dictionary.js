export default class Dictionary {
  static fill(translation) {
    Dictionary.translation = translation;
  }

  static get(key) {
    return Dictionary.translation[key];
  }
}
