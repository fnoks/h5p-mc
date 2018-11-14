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

    var $unitPanel = $('<div>', {
      'class': 'h5p-mini-course-units'
    });

    var results = [];
    var popup;
    // Create course units
    var renderer = LayoutFactory.getLayoutEngine();

    var numUnits = options.units.length;

    // TODO do this in a function
    options.units.forEach(function (unit, index) {
      var courseUnit = new CourseUnit(unit, index);
      renderer.add(courseUnit);
    });

    $unitPanel.append(renderer.getElement());

    renderer.on('show-popup', function (event) {
      showPopup(event.data.popupContent);
    });

    var maxScore = renderer.getMaxScore();

    var $results = $('<div>', {
      'class': 'h5p-mini-course-results'
    });

    $results.append($('<span>', {
      'class': 'h5p-mini-course-fullscreen-button enter',
      click: function () {
        H5P.semiFullScreen(self.$container, self);
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

    var currentPlacement;
    var placementExceptions = {};
    if (options.layout.resultsPlacement.exceptions) {
      options.layout.resultsPlacement.exceptions.forEach(function (exception) {
        placementExceptions[exception.columns] = exception.placement;
      });
    }

    self.on('enterFullScreen', function () {
      fullscreen = true;
    });

    // Respond to exit full screen event
    self.on('exitFullScreen', function () {
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
      progress.reset();
      score.reset();
      renderer.reset();

      //$endScreen.removeClass('visible');
      setTimeout(function () {
        $unitPanel.removeClass('finished');
      }, 600);
    };


    var showPopup = function ($elements, extraClass) {
      popup.show($elements, extraClass);
      /*$popupBg.append($content).appendTo(self.$container);
      setTimeout(function () {
        $popupBg.addClass('visible');
      }, 200);*/
    };

    var showSummary = function () {
      // Create summary page:

      for (var i = 2; i < 50; i++) {
        results[i] = {
          title: 'tittel',
          score: 10,
          maxScore: 20
        };
      }
      var summary = new Summary(score.getScore(), maxScore, results);
      var $summaryElement = summary.getElement();

      summary.on('retry', function () {
        popup.hide();
        $summaryElement.detach();
        self.reset();
      });

      showPopup([$summaryElement], 'summary');
    };

    var updateFullScreenButtonVisibility = function () {
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

      // If popup is showing

      // self.$container.css('min-height', '600px');

      // If results widget is on top, we need to place it on right side to check
      // how many columns there will be
      $results.css('min-height', '');
      //updateResultsPlacement(options.layout.resultsPlacement.default);

      var width = Math.floor($unitPanel.innerWidth());

      console.log(width);

      renderer.resize(width);

      //updateResultsPlacement(placementExceptions[columns] ? placementExceptions[columns] : options.layout.resultsPlacement.default)

      if (currentPlacement === 'right' || currentPlacement === 'left') {
        $results.css('min-height', $results.parent().height() + 'px');
      }

      updateFullScreenButtonVisibility();
    };
    self.on('resize', self.resize);

    /*function updateResultsPlacement(placement) {
      if (currentPlacement) {
        self.$container.removeClass('results-placement-' + currentPlacement);
      }
      self.$container.addClass('results-placement-' + placement);
      currentPlacement = placement;
    }*/

    /**
     * Attach to container
     * @param  {[type]} $container [description]
     * @return {[type]}
     */
    self.attach = ($container) => {
      self.$container = $container;
      popup = new Popup(1, self.$container); // TODO - use options - or remove this z-index thingy??

      // Something strange about the order here:
      score.appendTo($scorePanel);
      progress.appendTo($progressPanel);

      $results.appendTo($container);

      //courseUnits[0].enable();
      $unitPanel.appendTo($container);
      $fullscreenOverlay.appendTo($container);

      updateFullScreenButtonVisibility();
    };
  }
}
