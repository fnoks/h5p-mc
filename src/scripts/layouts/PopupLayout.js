import BaseLayout from './BaseLayout';
import Dictionary from '../Dictionary';
import Popup from '../Popup';
import Options from '../Options';

const $ = H5P.jQuery;

class HeaderButton extends H5P.EventDispatcher {

  /**
   * @constructor
   */
  constructor() {
    super();

    this.state = 'skip';

    // Create dom element
    this.$action = $('<a>', {
      'class': 'header-button skip-lesson',
      'text': Dictionary.get('skipLabel'),
      tabindex: 0,
      click: () => {
        this.trigger(this.state);
      }
    });
  }

  /**
   * Get DOM element.
   * @return {jQuery} DOM element.
   */
  getDomElement() {
    return this.$action;
  }

  /**
   * Set state.
   * @param {string} newState State to set.
   */
  setState(newState) {
    this.state = newState;
    this.$action.toggleClass('h5p-joubelui-button continue', this.state === 'continue')
      .toggleClass('skip-lesson', this.state === 'skip')
      .text(this.state === 'skip' ? Dictionary.get('skipLabel') : Dictionary.get('continueLabel'));
  }

  /**
   * Set state to 'skip'.
   */
  skip() {
    this.setState('skip');
  }

  /**
   * Set state to 'continue'.
   */
  continue() {
    this.setState('continue');
  }

  /**
   * Focus.
   */
  focus() {
    this.$action.focus();
  }
}

export default class PopupLayout extends BaseLayout {
  constructor() {
    super();
  }

  /**
   * Add course unit to layout.
   * @param {CourseUnit} courseUnit Course unit.
   */
  add(courseUnit) {
    super.add(courseUnit);

    /*const progressedEvent = self.createXAPIEventTemplate('progressed');
    progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = event.data.index + 1;
    self.trigger(progressedEvent);*/

    courseUnit.on('show', () => {
      this.show(courseUnit);
    });

    /*courseUnit.on('finished', (event) => {

      self.$container.css('min-height', '');
      this.trigger('resize');

      courseUnit.done();
      progress.increment();
      if (event.data.score) {
        score.increment(event.data.score);
      }

      // Save the score
      results[event.data.index] = {
        title: unit.header,
        score: event.data.score,
        maxScore: event.data.maxScore
      };

      if (event.data.index + 1 < courseUnits.length) {
        this.courseUnits[event.data.index + 1].enable();
      }
      else {
        showSummary();
      }
    });*/

    // courseUnit.on('closing-popup', () => {
    //   this.$popupBg.removeClass('visible');
    //   this.popup.hide();
    // });
  }

  /**
   * Allow to continue.
   */
  canContinue() {
    this.headerButton.continue();
  }

  /**
   * Show specific course unit.
   * @param {CourseUnit} courseUnit Course unit.
   */
  show(courseUnit) {
    if (!courseUnit.enabled) {
      return;
    }

    if (!Options.all().behaviour.forceSequential) {
      this.activeElement = courseUnit.index;
    }

    this.headerButton = new HeaderButton();
    const instance = courseUnit.getInstance();
    const $h5pContent = $('<div>', {
      'class': 'h5p-sub-content'
    });

    instance.attach($h5pContent);

    if (!courseUnit.hasScore()) {
      this.headerButton.continue();
    }

    const $header = $('<div>', {
      'class': 'header',
      html: courseUnit.getHeader(),
      append: this.headerButton.getDomElement()
    });

    this.headerButton.on('skip', () => {
      const confirmDialog = new H5P.ConfirmationDialog({
        headerText: Dictionary.get('quitUnitConfirmationHeader'),
        dialogText: Dictionary.get('quitUnitConfirmationBody')
      });
      confirmDialog.appendTo(Popup.getInstance().getDomElement().get(0));
      confirmDialog.on('confirmed', () => this.hide());
      confirmDialog.show();
    });

    this.headerButton.on('continue', () => this.hide());

    Popup.getInstance().show([
      $header,
      $h5pContent
    ], courseUnit.getClassName());

    setTimeout(() => {
      this.headerButton.focus();
    }, 400);

    instance.trigger('resize');
  }

  /**
   * Hide currently open course unit.
   */
  hide() {
    Popup.getInstance().hide();
    this.enableNext();
  }
}
