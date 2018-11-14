import BaseLayout from './BaseLayout';
import Dictionary from '../Dictionary';
import Popup from '../Popup';

const $ = H5P.jQuery;

class HeaderButton extends H5P.EventDispatcher {

  constructor() {
    super();
    var self = this;

    var state = 'skip';

    // Create dom element
    var $action = $('<a>', {
      'class': 'header-button skip-lesson',
      'text': Dictionary.get('skipLabel'),
      click: function () {
        self.trigger(state);
      }
    });

    self.getDomElement = function () {
      return $action;
    };

    self.setState = function (newState) {
      state = newState;
      $action.toggleClass('h5p-joubelui-button continue', state === 'continue')
        .toggleClass('skip-lesson', state === 'skip')
        .text(state === 'skip' ? Dictionary.get('skipLabel') : Dictionary.get('continueLabel'));
    };

    self.skip = function () {
      self.setState('skip');
    };

    self.continue = function () {
      self.setState('continue');
    };
  }
}

export default class PopupLayout extends BaseLayout {
  constructor() {
    super();

    this.popup = new Popup();
  }

  add(courseUnit) {
    super.add(courseUnit);

    //courseUnit.on('open-popup', (event) => {
      //showPopup(event.data.popupContent);
      //this.trigger('open-popup', event);


      /*var progressedEvent = self.createXAPIEventTemplate('progressed');
      progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = event.data.index + 1;
      self.trigger(progressedEvent);*/
    //});

    // TODO - handle this in a function
    courseUnit.on('finished', (event) => {

      self.$container.css('min-height', '');
      this.trigger('resize');

      //$popupBg.removeClass('visible');
      //$popupBg.detach();

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
    });

    courseUnit.on('closing-popup', function () {
      //$popupBg.removeClass('visible');
      popup.hide();
    });
  }

  show(courseUnit) {
    if (!this.enabled) {
      return;
    }

    const instance = courseUnit.getInstance();
    var $h5pContent = $('<div>', {
      'class': 'h5p-sub-content'
    });

    instance.attach($h5pContent);

    var headerButton = new HeaderButton();
    if (!courseUnit.hasScore()) {
      headerButton.continue();
    }

    var $header = $('<div>', {
      'class': 'header',
      text: courseUnit.getHeader(),
      append: self.headerButton.getDomElement()
    });

    //$unitPopup.prepend($header);
    //$
    headerButton.on('skip', function () {
      var confirmDialog = new H5P.ConfirmationDialog({headerText: 'Are you sure?', dialogText: 'If quiting this lesson, no score will be given.'});
      confirmDialog.appendTo($unitPopup.get(0));
      confirmDialog.on('confirmed', function () {
        self.hide();
      });
      confirmDialog.show();
    });

    self.headerButton.on('continue', function () {
      self.hide(self.score);
    });


    // Attach popup to body:
    //$('body').append($unitPopupBg);
    //$popupContainer.append($unitPopupBg);

    // Hide if ESC is pressed
    /*$('body').on('keyup.h5p-escape', function (event) {
      if (event.keyCode == 27) {
        $unitPopup.find('.quit-lesson').click();
      }
    });*/

    /*setTimeout(function () {
      $unitPopup.addClass('visible');
    }, 200);*/

    self.trigger('open-popup', {
      popupContent: [
        $header,
        $h5pContent
      ],
      index: index
    });
    instance.on('resize', function () {
      self.trigger('resize');
    });
    instance.trigger('resize');
    self.trigger('resize');
  };

}
