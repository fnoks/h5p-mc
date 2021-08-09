import PopupLayout from './PopupLayout';
import Options from '../Options';
import Dictionary from '../Dictionary';
import CourseUnit from '../CourseUnit';

const $ = H5P.jQuery;

class UnitHeader {

  constructor(hasScore, maxScore) {

    const self = this;

    const $element = $('<div>', {
      'class': 'h5p-mini-course-unit-header'
    });

    const $label = $('<div>', {
      'class': 'h5p-mini-course-unit-header-label'
    }).appendTo($element);

    const $value = $('<div>', {
      'class': 'h5p-mini-course-unit-header-value'
    }).appendTo($element);

    self.getDomElement = function () {
      return $element;
    };

    self.setState = function (state, score) {
      $label.text(hasScore ? (state === 'ready' ? Dictionary.get('maxScoreLabel') : Dictionary.get('youGotLabel')) : Dictionary.get('infoLessonLabel'));

      let value = ''
      if (!hasScore) {
        value = Dictionary.get('infoLessonValue');
      }
      else {
        value = state === 'ready' ? maxScore + ' points' : score + ' of ' + maxScore + ' points';
      }

      $value.text(value);
    };

    // Initial setups
    self.setState('ready');
  }
}

class GridUnit extends CourseUnit {
  constructor(options, index) {
    super(options, index);

    this.enabled = false;

    this.$unitPanel = $('<div>', {
      'class': 'h5p-mini-course-unit-panel locked'
    });

    this.$unitPanelInner = $('<div>', {
      'class': 'h5p-mini-course-unit-panel-inner ' + this.getClassName(),
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

  getDomElement() {
    return this.$unitPanel;
  }

  setWidth(width) {
    this.$unitPanel.css({width: width + '%'});
  }

  enable() {
    this.enabled = true;
    this.$unitPanel.removeClass('locked').addClass('enabled');
    this.$beginButton.html(Dictionary.get('lessonStartLabel')).removeAttr('disabled').attr('data-state', 'ready');

    setTimeout(() => this.$beginButton.focus(), 1);
  }

  done(score) {
    if (score) {
      this.unitHeader.setState('done', this.score);
    }

    this.$beginButton.html(Dictionary.get('lessonCompletedLabel')).attr('disabled', 'disabled');
    this.$unitPanel.removeClass('enabled').addClass('done');
  }

  reset() {
    super.reset();
    this.$beginButton.html(Dictionary.get('lessonLockedLabel'));
    //this.headerButton.skip();
    this.$unitPanel.removeClass('done').addClass('locked');
  }
}

export default class GridLayout extends PopupLayout {

  constructor() {
    super();

    this.minimumWidth = Options.all().layout.minimumWidth;

    this.$container = $('<div>', {
      'class': 'h5p-grid h5p-units'
    });
  }

  getElement() {
    return this.$container;
  }

  add(options, index) {
    const gridElement = new GridUnit(options, index);
    const $domElement = gridElement.getDomElement();
    $domElement.appendTo(this.$container);
    super.add(gridElement);
  }

  resize(width) {
    super.resize();

    let columns = Math.floor(width / this.minimumWidth);
    columns = (columns === 0 ? 1 : columns);

    // If more place, and single row, fill it up
    if (columns > this.courseUnits.length) {
      columns = this.courseUnits.length;
    }

    const columnsWidth = Math.floor(100 / columns);

    this.courseUnits.forEach(function (unit) {
      unit.setWidth(columnsWidth);
    });
  }
}
