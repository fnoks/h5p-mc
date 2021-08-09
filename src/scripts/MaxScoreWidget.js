import Dictionary from './Dictionary';

const $ = H5P.jQuery;

export default class MaxScoreWidget {

  constructor(maxScore) {
    const self = this;

    const $element = $('<div>', {
      'class': 'h5p-mini-course-max-score-widget h5p-mini-course-result-panel',
      'html':
        '<div class="max-score-widget-title">' + Dictionary.get('maxScoreLabel') + '</div>' +
        '<div class="max-score-widget-bg">' +
          '<div class="max-score-widget-score">' + maxScore + '</div>' +
        '</div>'
    });

    self.getElement = function () {
      return $element;
    };
  }
}
