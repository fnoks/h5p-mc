
const $ = H5P.jQuery;

export default class Summary extends H5P.EventDispatcher {

  constructor(params = {}) {
    super();

    const self = this;
    const $element = $('<div>', {
      'class': 'h5p-mini-course-summary'
    });

    // Header
    $element.append($('<div>', {
      'class': 'h5p-mini-course-summary-header',
      text: params.l10n.header
    }));

    const messageOverallResult = params.l10n.overallResult
      .replace('%score', params.score)
      .replace('%maxScore', params.maxScore);

    // Create scorebar:
    const scoreBar = H5P.JoubelUI.createScoreBar(params.maxScore, messageOverallResult);

    scoreBar.appendTo($element);
    setTimeout(function () {
      scoreBar.setScore(params.score);
    }, 0);
    // Greeting
    $element.append($('<div>', {
      'class': 'h5p-mini-course-summary-greeting',
      text: messageOverallResult
    }));

    // Add detailed results
    const $detailedResults = $('<div>', {
      'class': 'h5p-mini-course-summary-lesson-results'
    });
    params.results.forEach(function (result) {
      const score = (typeof result.score === 'number') ?
        (result.score + '/' + result.maxScore) :
        params.l10n.noScore;

      $detailedResults.append($('<div>', {
        'class': 'h5p-mini-course-summary-lesson-result',
        html: '<span class="prefix">Lesson ' + result.index + '</span><span class="title">' + result.header + '</span><span class="score">' + score + '</span>'
      }));
    });
    $element.append($detailedResults);

    // Retry button
    $element.append(H5P.JoubelUI.createButton({
      'class': 'h5p-mini-course-unit-retry',
      text: params.l10n.tryAgain,
      click: function () {
        self.trigger('retry');
      }
    }));

    self.getElement = function () {
      return $element;
    };
  }
}
