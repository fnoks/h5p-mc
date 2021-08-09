import PopupLayout from './PopupLayout';
import Options from '../Options';
import Dictionary from '../Dictionary';
import CourseUnit from '../CourseUnit';

const $ = H5P.jQuery;

class UnitHeader {

  /**
   * @constructor
   * @param {function} hasScore Callback to determine if score was set.
   * @param {number} maxScore Maxumum achievable score.
   */
  constructor(hasScore, maxScore) {
    this.hasScore = hasScore;
    this.maxScore = maxScore;

    this.$element = $('<div>', {
      'class': 'h5p-mini-course-unit-header'
    });

    this.$label = $('<div>', {
      'class': 'h5p-mini-course-unit-header-label'
    }).appendTo(this.$element);

    this.$value = $('<div>', {
      'class': 'h5p-mini-course-unit-header-value'
    }).appendTo(this.$element);

    // Initial setups
    this.setState('ready');
  }

  /**
   * Get DOM element.
   * @return {jQuery} DOM element.
   */
  getDomElement() {
    return this.$element;
  }

  /**
   * Set state.
   * @param {string} state State.
   * @param {number} score Score.
   */
  setState(state, score) {
    this.$label.text(this.hasScore ? (state === 'ready' ? Dictionary.get('maxScoreLabel') : Dictionary.get('youGotLabel')) : Dictionary.get('infoLessonLabel'));

    let value = '';
    if (!this.hasScore) {
      value = `0 ${Dictionary.get('points')}`;
    }
    else {
      value = (state === 'ready') ?
        `${this.maxScore} ${Dictionary.get('points')}` :
        `${score} ${Dictionary.get('of')} ${this.maxScore} ${Dictionary.get('points')}`;
    }

    this.$value.text(value);
  }
}

class GridUnit extends CourseUnit {
  /**
   * @constructor
   * @param {object} options Options.
   * @param {number} index Unit index.
   */
  constructor(options, index) {
    super(options, index);

    this.enabled = false;

    this.$unitPanel = $('<div>', {
      'class': 'h5p-mini-course-unit-panel locked'
    });

    this.$unitPanelInner = $('<div>', {
      'class': `h5p-mini-course-unit-panel-inner ${this.getClassName()}`,
      tabIndex: 0
    }).appendTo(this.$unitPanel);

    this.unitHeader = new UnitHeader(this.hasScore(), this.getMaxScore());
    this.unitHeader.getDomElement().appendTo(this.$unitPanelInner);

    $('<div>', {
      'class': 'h5p-mini-course-unit-title',
      html: this.getHeader()
    }).appendTo(this.$unitPanelInner);

    $('<div>', {
      'class': 'h5p-mini-course-unit-intro',
      html: this.getIntro()
    }).appendTo(this.$unitPanelInner);

    this.$beginButton = $('<button>', {
      'class': 'h5p-mini-course-unit-begin',
      html: Dictionary.get('lessonLockedLabel'),
      disabled: 'disabled',
      click: () => this.trigger('show')
    }).appendTo(this.$unitPanelInner);
  }

  /**
   * Get DOM element.
   * @return {jQuery} DOM element for unit panel.
   */
  getDomElement() {
    return this.$unitPanel;
  }

  /**
   * Set width in percent.
   * @param {number} width Width in percent.
   */
  setWidth(width) {
    this.$unitPanel.css({width: `${width}%`});
  }

  /**
   * Enable.
   */
  enable() {
    this.enabled = true;
    this.$unitPanel.removeClass('locked').addClass('enabled');
    this.$beginButton.html(Dictionary.get('lessonStartLabel')).removeAttr('disabled').attr('data-state', 'ready');

    setTimeout(() => this.$beginButton.focus(), 1);
  }

  /**
   * Call unit done.
   * @param {number} score Score that was achieved.
   */
  done(score) {
    if (score) {
      this.unitHeader.setState('done', this.score);
    }

    this.$beginButton.html(Dictionary.get('lessonCompletedLabel')).attr('disabled', 'disabled');
    this.$unitPanel.removeClass('enabled').addClass('done');
  }

  /**
   * Reset.
   */
  reset() {
    super.reset();
    this.$beginButton.html(Dictionary.get('lessonLockedLabel'));
    //this.headerButton.skip();
    this.$unitPanel.removeClass('done').addClass('locked');
  }
}

export default class GridLayout extends PopupLayout {

  /**
   * @constructor
   */
  constructor() {
    super();

    this.minimumWidth = Options.all().layout.minimumWidth;

    this.$container = $('<div>', {
      'class': 'h5p-grid h5p-units'
    });
  }

  /**
   * Get DOM element.
   * @return {jQuery} DOM element.
   */
  getElement() {
    return this.$container;
  }

  /**
   * Add element.
   * @param {object} options Options.
   * @param {number} index element index.
   */
  add(options, index) {
    const gridElement = new GridUnit(options, index);
    const $domElement = gridElement.getDomElement();
    $domElement.appendTo(this.$container);
    super.add(gridElement);
  }

  /**
   * Resize element.
   * @param {number} width Width.
   */
  resize(width) {
    super.resize();

    let columns = Math.floor(width / this.minimumWidth);
    columns = (columns === 0 ? 1 : columns);

    // If more place, and single row, fill it up
    if (columns > this.courseUnits.length) {
      columns = this.courseUnits.length;
    }

    const columnsWidth = Math.floor(100 / columns);

    this.courseUnits.forEach((unit) => {
      unit.setWidth(columnsWidth);
    });
  }
}
