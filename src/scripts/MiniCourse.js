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
   * @param {object} options Options for single choice set.
   * @param {string} contentId H5P instance id.
   * @param {object} contentData H5P instance data.
   */
  constructor(options, contentId, contentData) {
    super();

    this.fullscreen = false;
    this.contentData = contentData;

    Dictionary.fill(options.dictionary);
    Options.fill(options, contentId);
    this.options = Options.sanitize(options);

    this.$unitPanel = $('<div>', {
      'class': 'h5p-mini-course-units',
      'css': {
        'background-color': options.theme.backgroundColorUnits
      }
    });

    this.results = [];
    const numUnits = options.units.length;

    this.renderer = LayoutFactory.getLayoutEngine();
    options.units.forEach((unit, index) => {
      this.renderer.add(unit, index);
    });

    this.$unitPanel.append(this.renderer.getElement());
    this.maxScore = this.renderer.getMaxScore();

    this.$results = $('<div>', {
      'class': 'h5p-mini-course-results',
      'css': {
        'background-color': options.theme.backgroundColorResults
      }
    });

    this.$results.append($('<span>', {
      'class': 'h5p-mini-course-fullscreen-button enter',
      click: () => {
        this.fullscreen = true;
        H5P.semiFullScreen(this.$container, this);
        /*const maxHeight = this.$container.height();
        this.$container.css('height', maxHeigh
        this.renderer.goFullscreen(maxHeight);*/
      }
    }));
    // Add minimize fullscreen icon:
    this.$results.append($('<span>', {
      'class': 'h5p-mini-course-fullscreen-button exit',
      click: () => {
        H5P.exitFullScreen();
      }
    }));

    this.maxScoreWidget = new MaxScoreWidget(this.maxScore);
    this.maxScoreWidget.getElement().appendTo(this.$results);

    this.$scorePanel = $('<div>', {
      'class': 'h5p-mini-course-score h5p-mini-course-result-panel'
    }).appendTo(this.$results);

    this.$progressPanel = $('<div>', {
      'class': 'h5p-mini-course-progress h5p-mini-course-result-panel'
    }).appendTo(this.$results);

    this.score = new ProgressCircle(this.maxScore, 'Your Score', false);
    this.progress = new ProgressCircle(numUnits, 'Lessons Completed', true);

    this.renderer.on('scored', event => {
      const result = event.data;

      const previousResult = this.results[result.index];

      if (previousResult) {
        this.score.increment(-previousResult.score);
      }

      this.results[result.index] = result;
      this.score.increment(result.score);
    });
    this.renderer.on('progress', event => this.progress.setCurrent(event.data.index));
    this.renderer.on('finished', () => this.showSummary());

    this.on('enterFullScreen', () => {
      this.$container.addClass('h5p-fullscreen');
      this.fullscreen = true;
    });

    // Respond to exit full screen event
    this.on('exitFullScreen', () => {
      this.$container.removeClass('h5p-fullscreen');
      this.fullscreen = false;
    });

    this.$fullscreenOverlay = $('<div>', {
      'class': 'h5p-mini-course-overlay',
      html: '<div class="h5p-mini-course-go-fullscreen">Open mini course</div>',
      click: () => {
        H5P.semiFullScreen(this.$container, this, () => {
          this.$fullscreenOverlay.removeClass('hide');
        });
        this.$fullscreenOverlay.addClass('hide');
      }
    });

    this.on('resize', this.resize);
  }

  /**
   * Reset course.
   */
  reset() {
    this.results = [];
    this.progress.reset();
    this.score.reset();
    this.renderer.reset();

    setTimeout(() => {
      this.$unitPanel.removeClass('finished');
    }, 600);
  }

  /**
   * Show the summary.
   */
  showSummary() {
    const summary = new Summary({
      score: this.score.getScore(),
      maxScore: this.maxScore,
      results: this.results
    });
    const $summaryElement = summary.getElement();

    summary.on('retry', () => {
      Popup.getInstance().hide();
      $summaryElement.detach();
      this.reset();
    });

    Popup.getInstance().replace([$summaryElement], 'summary');
  }

  /**
   * Update visibility of fullscreen button.
   */
  updateFullScreenButtonVisibility() {
    // If already in full screen, do nothing
    if (this.fullscreen) {
      return;
    }

    let forceFullscreen = false;
    if (this.options.layout.fullScreen.fullScreenMode === 'always') {
      forceFullscreen = true;
    }
    else if (this.options.layout.fullScreen.fullScreenMode === 'dynamic') {
      forceFullscreen = (this.$container.width() < this.options.layout.fullScreen.forceFullScreenWidthThreshold);
    }

    this.$container.toggleClass('h5p-mini-course-force-fullscreen', forceFullscreen);
  }

  /**
   * Resize content.
   */
  resize() {
    this.$unitPanel.css({ 'height': '', 'min-height': '' });
    this.$results.css('height', '');
    const width = Math.floor(this.$unitPanel.innerWidth());
    this.renderer.resize(width);

    if (this.fullscreen) {
      setTimeout(() => {
        this.setPanelSize();
      }, 0); // height values in panels needs to be reset in DOM
    }
    else {
      this.setPanelSize();
    }
  }

  /**
   * Set panel size.
   */
  setPanelSize() {
    const minHeight = `${this.$results.parent().height()}px`;

    if (this.$results.css('min-height') === '0px') {
      this.$results.css('min-height', minHeight);
    }
    this.$results.css('height', minHeight);

    this.$unitPanel.css(this.fullscreen ? 'height' : 'min-height', minHeight);
  }

  /**
   * Attach to container
   * @param  {jQuery} $container Container to attach course content to.
   */
  attach($container) {
    this.$container = $container;
    Popup.setup($container);

    // Something strange about the order here:
    this.score.appendTo(this.$scorePanel);
    this.progress.appendTo(this.$progressPanel);
    this.$results.appendTo($container);
    this.$unitPanel.appendTo($container);
    this.$fullscreenOverlay.appendTo($container);

    this.updateFullScreenButtonVisibility();
  }
}
