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
}
