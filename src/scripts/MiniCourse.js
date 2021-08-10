import LayoutFactory from './LayoutFactory';
import Dictionary from './Dictionary';
import Options from './Options';
import MaxScoreWidget from './MaxScoreWidget';
import ProgressCircle from './ProgressCircle';
import Summary from './Summary';
import Popup from './Popup';

const $ = H5P.jQuery;

const DEFAULT_DESCRIPTION = 'Mini Course';

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

    this.options = Options.sanitize(options);
    Dictionary.fill(options.dictionary);
    Options.fill(options, contentId);

    this.$unitPanel = $('<div>', {
      'class': 'h5p-mini-course-units',
      'css': {
        'background-color': this.options.theme.backgroundColorUnits
      }
    });

    this.results = [];
    const numUnits = this.options.units.length;

    this.renderer = LayoutFactory.getLayoutEngine();
    this.options.units.forEach((unit, index) => {
      this.renderer.add(unit, index);
    });

    this.renderer.on('finished', () => {
      this.handleCourseFinished();
    });

    this.$unitPanel.append(this.renderer.getElement());
    this.maxScore = this.renderer.getMaxScore();

    this.$results = $('<div>', {
      'class': 'h5p-mini-course-results',
      'css': {
        'background-color': this.options.theme.backgroundColorResults
      }
    });

    if (Options.all().layout.fullScreen.fullScreenMode !== 'never') {
      this.$results.append($('<span>', {
        'class': 'h5p-mini-course-fullscreen-button enter',
        click: () => {
          this.handleEnterFullscreen();
        }
      }));

      // Add minimize fullscreen icon:
      this.$results.append($('<span>', {
        'class': 'h5p-mini-course-fullscreen-button exit',
        click: () => {
          H5P.exitFullScreen();
        }
      }));
    }

    this.maxScoreWidget = new MaxScoreWidget(this.maxScore);
    this.maxScoreWidget.getElement().appendTo(this.$results);

    this.$scorePanel = $('<div>', {
      'class': 'h5p-mini-course-score h5p-mini-course-result-panel'
    }).appendTo(this.$results);

    this.$progressPanel = $('<div>', {
      'class': 'h5p-mini-course-progress h5p-mini-course-result-panel'
    }).appendTo(this.$results);

    this.score = new ProgressCircle(this.maxScore, Dictionary.get('scoreLabel'), false);
    this.progress = new ProgressCircle(numUnits, Dictionary.get('progressLabel'), true);

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
      html: `<div class="h5p-mini-course-go-fullscreen">${Dictionary.get('openMiniCourse')}</div>`,
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

    // Go to fullscreen dynamically - may not work unless user interacted with content
    if (
      !this.fullscreen &&
      Options.all().layout.fullScreen.fullScreenMode === 'dynamic'
      && this.$container.width() < Options.all().layout.fullScreen.forceFullScreenWidthThreshold
    ) {
      this.handleEnterFullscreen();
    }

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

  /**
   * Handle course finished.
   */
  handleCourseFinished() {
    // Trigger xAPI answered
    const xAPIEvent = new H5P.XAPIEvent();
    $.extend(xAPIEvent.data, this.getXAPIData());
    this.trigger(xAPIEvent);
  }

  /**
   * Get latest score.
   * @return {number} latest score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  getScore() {
    return this.renderer.getScore();
  }

  /**
   * Get maximum possible score.
   * @return {number} Score necessary for mastering.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  getMaxScore() {
    return this.renderer.getMaxScore();
  }

  /**
   * Determine whether course is passed.
   * @return {boolean} True, if course is passed, else false.
   */
  isPassed() {
    return this.getScore() === this.getMaxScore();
  }

  /**
   * Determine whether course is completed.
   * @return {boolean} True, if course is completed, else false.
   */
  isCompleted() {
    return true;
  }

  /**
   * Get xAPI data.
   * @return {object} XAPI statement.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  getXAPIData() {
    const xAPIEvent = this.createXAPIEventTemplate('answered');

    // Definition
    $.extend(
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
      {
        name: { 'en-US': this.getTitle() },
        description: { 'en-US': DEFAULT_DESCRIPTION },
        interactionType: 'compound', // Required by PHP report, but invalid xAPI
        type: 'http://adlnet.gov/expapi/activities/cmi.interaction'
      }
    );

    // Result
    xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this,
      this.isCompleted(), this.isPassed());

    return {
      statement: xAPIEvent.data.statement,
      children: this.renderer.getXAPIChildrenData()
    };
  }

  /**
   * Get title.
   * @return {string} Title.
   */
  getTitle() {
    let raw;
    if (this.contentData.metadata) {
      raw = this.contentData.metadata.title;
    }
    raw = raw || DEFAULT_DESCRIPTION.DEFAULT_DESCRIPTION;

    // H5P Core function: createTitle
    return H5P.createTitle(raw);
  }

  /**
   * Handle enter fullscreen.
   */
  handleEnterFullscreen() {
    this.fullscreen = true;
    H5P.semiFullScreen(this.$container, this);
    /*const maxHeight = this.$container.height();
    this.$container.css('height', maxHeigh
    this.renderer.goFullscreen(maxHeight);*/
  }
}
