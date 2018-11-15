import PopupLayout from './PopupLayout';
import Options from '../Options';
import Dictionary from '../Dictionary';

const $ = H5P.jQuery;

class UnitHeader {

  constructor(maxScore) {

    var self = this;
    // States: ready, completed
    var hasScore = !!maxScore;

    var $element = $('<div>', {
      'class': 'h5p-mini-course-unit-header'
    });

    var $label = $('<div>', {
      'class': 'h5p-mini-course-unit-header-label'
    }).appendTo($element);

    var $value = $('<div>', {
      'class': 'h5p-mini-course-unit-header-value'
    }).appendTo($element);

    self.getDomElement = function () {
      return $element;
    };

    self.setState = function (state, score) {
      $label.text(hasScore ? (state === 'ready' ? Dictionary.get('maxScoreLabel') : Dictionary.get('youGotLabel')) : Dictionary.get('infoLessonLabel'));
      $value.text(hasScore ? (state === 'ready' ? maxScore + ' points' : score + ' of ' + maxScore + ' points') : Dictionary.get('infoLessonValue'));
    };

    // Initial setups
    self.setState('ready');
  }
}

class GridUnit extends H5P.EventDispatcher {
  constructor(courseUnit) {
    super();

    this.enabled = false;

    this.$unitPanel = $('<div>', {
      'class': 'h5p-mini-course-unit-panel locked'
    });

    this.$unitPanelInner = $('<div>', {
      'class': 'h5p-mini-course-unit-panel-inner ' + courseUnit.getMachineName(),
      tabIndex: 0
    }).appendTo(this.$unitPanel);

    var unitHeader = new UnitHeader(courseUnit.getMaxScore());
    unitHeader.getDomElement().appendTo(this.$unitPanelInner);

    $('<div>', {
      'class': 'h5p-mini-course-unit-title',
      html: courseUnit.getHeader()
    }).appendTo(this.$unitPanelInner);

    $('<div>', {
      'class': 'h5p-mini-course-unit-intro',
      html: courseUnit.getIntro()
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
}


export default class GridLayout extends PopupLayout {

  constructor() {
    super();

    this.minimumWidth = Options.all().layout.minimumWidth;

    this.$container = $('<div>', {
      'class': 'h5p-grid h5p-units h5p-mini-course-units'
    });

    this.elements =[];
  }

  getElement() {
    return this.$container;
  }

  add(courseUnit) {

    //courseUnit.appendTo(this.$container);
    //
    const gridElement = new GridUnit(courseUnit);
    this.elements.push(gridElement);
    const $domElement = gridElement.getDomElement();
    $domElement.appendTo(this.$container);
    //courseUnit.setDomElement($domElement);
    //
    super.add(courseUnit);

    gridElement.on('show', () => {
      console.log('SHOWING!!');
      this.show(courseUnit);
    });
  }

  resize(width) {
    var columns = Math.floor(width / this.minimumWidth);
    columns = (columns === 0 ? 1 : columns);

    // If more place, and single row, fill it up
    if (columns > this.courseUnits.length) {
      columns = this.courseUnits.length;
    }

    var columnsWidth = Math.floor(100 / columns);

    // iterate course units:
    //var widestUnit = 0;
    this.elements.forEach(function (element) {
      element.setWidth(columnsWidth);
    });
  }

  reset() {
    // Reset all units
    this.courseUnits.forEach(function (unit) {
      unit.reset();
    });

    // Enable first unit:
    //this.courseUnits[0].enable();
  }

  enable(index) {
    this.elements[index].enable();
  }
}
