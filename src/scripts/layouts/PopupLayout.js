import BaseLayout from './BaseLayout';

export default class PopupLayout extends BaseLayout {
  constructor() {
    super();
  }

  add(courseUnit) {
    super.add(courseUnit);

    courseUnit.on('open-popup', (event) => {
      //showPopup(event.data.popupContent);
      this.trigger('open-popup', event);


      /*var progressedEvent = self.createXAPIEventTemplate('progressed');
      progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = event.data.index + 1;
      self.trigger(progressedEvent);*/
    });

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
}
