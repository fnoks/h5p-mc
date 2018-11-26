
const $ = H5P.jQuery;

export default class Summary extends H5P.EventDispatcher {

  constructor(score, maxScore, lessonResults) {
    super();

    const self = this;
    const $element = $('<div>', {
      'class': 'h5p-mini-course-summary'
    });

    // Header
    $element.append($('<div>', {
      'class': 'h5p-mini-course-summary-header',
      text: 'You have completed the mini course!' // TODO
    }));

    // Create scorebar:
    var scoreBar = H5P.JoubelUI.createScoreBar(maxScore, 'LABEL TODO');

    scoreBar.appendTo($element);
    setTimeout(function () {
      scoreBar.setScore(score);
    }, 0);
    // Greeting
    $element.append($('<div>', {
      'class': 'h5p-mini-course-summary-greeting',
      text: 'You won 250 of 300 points!' // TODO
    }));

    // Add detailed results
    var $detailedResults = $('<div>', {
      'class': 'h5p-mini-course-summary-lesson-results'
    });
    lessonResults.forEach(function (result) {
      var score = result.score ? (result.score + '/' + result.maxScore) : 'No score'; // TODO

      $detailedResults.append($('<div>', {
        'class': 'h5p-mini-course-summary-lesson-result',
        html: '<span class="prefix">Lesson ' + result.index + '</span><span class="title">' + result.header + '</span><span class="score">' + score + '</span>'
      }));
    });
    $element.append($detailedResults);

    // Retry button
    $element.append(H5P.JoubelUI.createButton({
      'class': 'h5p-mini-course-unit-retry',
      text: 'Try again', // TODO - translate
      click: function () {
        self.trigger('retry');
      }
    }));

    self.getElement = function () {
      return $element;
    };
  }
}
