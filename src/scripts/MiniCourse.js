import CourseUnit from './CourseUnit';
import LayoutFactory from './LayoutFactory';
import Dictionary from './Dictionary';
import Options from './Options';
import MaxScoreWidget from './MaxScoreWidget';
import ProgressCircle from './ProgressCircle';
import Summary from './Summary';
import Popup from './Popup';

const $ = H5P.jQuery;

export default class MiniCourse extends H5P.EventDispatcher {
  /**
   * @constructor
   * @extends Question
   * @param {object} options Options for single choice set
   * @param {string} contentId H5P instance id
   * @param {Object} contentData H5P instance data
   */
  constructor(options, contentId, contentData) {
    super();
    var self = this;

    var fullscreen = false;

    Dictionary.fill(options.dictionary);
    Options.fill(options, contentId);
    options = Options.sanitize(options);

    var $unitPanel = $('<div>', {
      'class': 'h5p-mini-course-units'
    });

    var results = [];
    var numUnits = options.units.length;

    var renderer = LayoutFactory.getLayoutEngine();
    options.units.forEach(function (unit, index) {
      renderer.add(unit, index);
    });

    $unitPanel.append(renderer.getElement());
    var maxScore = renderer.getMaxScore();

    var $results = $('<div>', {
      'class': 'h5p-mini-course-results'
    });

    $results.append($('<span>', {
      'class': 'h5p-mini-course-fullscreen-button enter',
      click: function () {
        fullscreen = true;
        H5P.semiFullScreen(self.$container, self);
        /*const maxHeight = self.$container.height();
        self.$container.css('height', maxHeigh
        renderer.goFullscreen(maxHeight);*/
      }
    }));
    // Add minimize fullscreen icon:
    $results.append($('<span>', {
      'class': 'h5p-mini-course-fullscreen-button exit',
      click: function () {
        H5P.exitFullScreen();
      }
    }));

    var maxScoreWidget = new MaxScoreWidget(maxScore);
    maxScoreWidget.getElement().appendTo($results);

    var $scorePanel = $('<div>', {
      'class': 'h5p-mini-course-score h5p-mini-course-result-panel'
    }).appendTo($results);

    var $progressPanel = $('<div>', {
      'class': 'h5p-mini-course-progress h5p-mini-course-result-panel'
    }).appendTo($results);

    var score = new ProgressCircle(maxScore, 'Your Score', false);
    var progress = new ProgressCircle(numUnits, 'Lessons Completed', true);

    renderer.on('scored', event => {
      const result = event.data;

      const previousResult = results[result.index];

      if (previousResult) {
        score.increment(-previousResult.score);
      }

      results[result.index] = result;
      score.increment(result.score);
    });
    renderer.on('progress', event => progress.setCurrent(event.data.index));
    renderer.on('finished', event => showSummary());

    self.on('enterFullScreen', function () {
      this.$container.addClass('h5p-fullscreen');
      fullscreen = true;
    });

    // Respond to exit full screen event
    self.on('exitFullScreen', function () {
      this.$container.removeClass('h5p-fullscreen');
      fullscreen = false;
    });

    var $fullscreenOverlay = $('<div>', {
      'class': 'h5p-mini-course-overlay',
      html: '<div class="h5p-mini-course-go-fullscreen">Open mini course</div>',
      click: function () {
        H5P.semiFullScreen(self.$container, self, function () {
          $fullscreenOverlay.removeClass('hide');
        });
        $fullscreenOverlay.addClass('hide');
      }
    });

    self.reset = function () {
      results = [];
      progress.reset();
      score.reset();
      renderer.reset();

      setTimeout(function () {
        $unitPanel.removeClass('finished');
      }, 600);
    };

    var showSummary = () => {
      var summary = new Summary({
        score: score.getScore(),
        maxScore: maxScore,
        results: results,
        l10n: options.dictionary.summary
      });
      var $summaryElement = summary.getElement();

      summary.on('retry', () => {
        Popup.getInstance().hide();
        $summaryElement.detach();
        self.reset();
      });

      Popup.getInstance().replace([$summaryElement], 'summary');
    };

    var updateFullScreenButtonVisibility = () => {
      // If already in full screen, do nothing
      if (fullscreen) {
        return;
      }

      var forceFullscreen = false;
      if (options.layout.fullScreen.fullScreenMode === 'always') {
        forceFullscreen = true;
      }
      else if (options.layout.fullScreen.fullScreenMode === 'dynamic') {
        forceFullscreen = (self.$container.width() < options.layout.fullScreen.forceFullScreenWidthThreshold);
      }

      self.$container.toggleClass('h5p-mini-course-force-fullscreen', forceFullscreen);
    };

    self.resize = () => {
      $unitPanel.css({ 'height': '', 'min-height': '' });
      $results.css('height', '');
      var width = Math.floor($unitPanel.innerWidth());
      renderer.resize(width);

      if (fullscreen) {
        setTimeout(() => {
          self.setPanelSize();
        }, 0); // height values in panels needs to be reset in DOM
      }
      else {
        self.setPanelSize();
      }
    };

    /**
     * Set panel size.
     */
    self.setPanelSize = () => {
      const minHeight = $results.parent().height() + 'px';

      if ($results.css('min-height') === '0px') {
        $results.css('min-height', minHeight);
      }
      $results.css('height', minHeight);

      $unitPanel.css(fullscreen ? 'height' : 'min-height', minHeight);
    };

    self.on('resize', self.resize);

    /**
     * Attach to container
     * @param  {[type]} $container [description]
     * @return {[type]}
     */
    self.attach = ($container) => {
      self.$container = $container;
      Popup.setup($container);

      // Something strange about the order here:
      score.appendTo($scorePanel);
      progress.appendTo($progressPanel);
      $results.appendTo($container);
      $unitPanel.appendTo($container);
      $fullscreenOverlay.appendTo($container);

      updateFullScreenButtonVisibility();
    };
  }
}
