import Dictionary from './Dictionary';
import Options from './Options';

const $ = H5P.jQuery;

export default class Summary extends H5P.EventDispatcher {

  /**
   * @constructor
   * @param {object} params Parameters.
   * @param {number} params.score Score that was achieved.
   * @param {number} params.maxScore Maximum score achievable.
   * @param {object[]} params.results Results of tasks.
   */
  constructor(params = {}) {
    super();

    this.params = params;

    this.$element = $('<div>', {
      'class': 'h5p-mini-course-summary'
    });

    // Header
    this.$element.append($('<div>', {
      'class': 'h5p-mini-course-summary-header',
      text: Dictionary.get('summary').header
    }));

    const messageOverallResult = Dictionary.get('summary').overallResult
      .replace('%score', this.params.score)
      .replace('%maxScore', this.params.maxScore);

    // Create scorebar:
    const scoreBar = H5P.JoubelUI.createScoreBar(this.params.maxScore, messageOverallResult);

    scoreBar.appendTo(this.$element);
    setTimeout(() => {
      scoreBar.setScore(this.params.score);
    }, 0);

    // Greeting
    this.$element.append($('<div>', {
      'class': 'h5p-mini-course-summary-greeting',
      text: messageOverallResult
    }));

    // Add detailed results
    const $detailedResults = $('<div>', {
      'class': 'h5p-mini-course-summary-lesson-results'
    });
    this.params.results.forEach((result) => {
      const score = (typeof result.score === 'number') ?
        (`${result.score}/${result.maxScore}`) :
        Dictionary.get('summary').noScore;

      $detailedResults.append($('<div>', {
        'class': 'h5p-mini-course-summary-lesson-result',
        html: `<span class="prefix">Lesson ${result.index}</span><span class="title">${result.header}</span><span class="score">${score}</span>'`
      }));
    });
    this.$element.append($detailedResults);

    if (Options.all().behaviour.retry) {
      // Retry button
      this.$element.append(H5P.JoubelUI.createButton({
        'class': 'h5p-mini-course-unit-retry',
        text: Dictionary.get('summary').tryAgain,
        click: () => {
          this.trigger('retry');
        }
      }));      
    }
  }

  /**
   * Get DOM element.
   * @return {jQuery} DOM element.
   */
  getElement() {
    return this.$element;
  }
}
