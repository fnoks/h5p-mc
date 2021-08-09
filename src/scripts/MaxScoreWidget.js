import Dictionary from './Dictionary';

const $ = H5P.jQuery;

export default class MaxScoreWidget {
  /**
   * @constructor
   * @param {number} maxScore Maximum score achievable.
   */
  constructor(maxScore) {
    this.$element = $('<div>', {
      'class': 'h5p-mini-course-max-score-widget h5p-mini-course-result-panel',
      'html':
        '<div class="max-score-widget-title">' + Dictionary.get('maxScoreLabel') + '</div>' +
        '<div class="max-score-widget-bg">' +
          '<div class="max-score-widget-score">' + maxScore + '</div>' +
        '</div>'
    });
  }

  /**
   * @return {jQuery} DOM element.
   */
  getElement() {
    return this.$element;
  }
}
