import Dictionary from './Dictionary';
import Options from './Options';

const $ = H5P.jQuery;

export default class CourseUnit extends H5P.EventDispatcher {

  constructor(options, index) {
    super();

    var self = this;

    var instance;
    var enabled = false;

    this.options = options;

    const libraryMeta = H5P.libraryFromString(options.action.library);
    this.machineName = libraryMeta.machineName.toLowerCase().replace('.', '-');

    /*self.appendTo = function ($container) {
      $unitPanel.appendTo($container);
    };*/

    /*self.setDomElement = function ($ref) {
      this.$domElement = $ref;
    };*/

    self.hasScore = function () {
      return (options.maxScore !== 0);
    };

    self.getMaxScore = function () {
      return options.maxScore ? options.maxScore : 0;
    };

    //self.enable = function () {
      /*enabled = true;
      $unitPanel.removeClass('locked').addClass('enabled');
      $beginButton.html(Dictionary.get('lessonStartLabel')).removeAttr('disabled').attr('data-state', 'ready');

      setTimeout(function () {
        $beginButton.focus();
      },1);*/
    //};

    self.show = function () {
      if (!enabled) {
        return;
      }

      if (instance === undefined) {

        var $h5pContent = $('<div>', {
          'class': 'h5p-sub-content'
        });

        instance.attach($h5pContent);

        self.headerButton = new HeaderButton();
        if (!self.hasScore()) {
          self.headerButton.continue();
        }

        var $header = $('<div>', {
          'class': 'header',
          text: options.header,
          append: self.headerButton.getDomElement()
        });

        //$unitPopup.prepend($header);
        //$


        self.headerButton.on('skip', function () {
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

        /*$unitPopup.find('.quit-lesson').click(function () {
          if (self.hasScore()) {
            var confirmDialog = new H5P.ConfirmationDialog({headerText: 'Are you sure?', dialogText: 'If quiting this lesson, no score will be given.'});
            confirmDialog.appendTo($unitPopup.get(0));
            confirmDialog.on('confirmed', function () {
              self.hide();
            });
            confirmDialog.show();
          }
          else {
            self.hide();
          }
        });*/
      }

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



    self.hide = function (score) {
      $('body').off('keyup.h5p-escape');

      self.trigger('closing-popup');

      // Set score in unit-header
      unitHeader.setState('completed', score);

      setTimeout(function () {
        self.trigger('finished', {index: index, score: score, maxScore: self.getMaxScore()});
      }, 1000);
    };

    self.done = function () {
      $beginButton.html(Dictionary.get('lessonCompletedLabel')).attr('disabled', 'disabled');
      $unitPanel.removeClass('enabled').addClass('done');
    };

    self.reset = function () {
      if (instance && instance.resetTask) {
        instance.resetTask();
      }
      $beginButton.html(Dictionary.get('lessonLockedLabel'));
      self.headerButton.skip();
      $unitPanel.removeClass('done').addClass('locked');
    };

    /*var $unitPopup = $('<div>', {
      'class': 'h5p-mini-course-popup ' + machineName
    });*/


  }

  getInstance() {
    if (this.instance === undefined) {
      this.instance = H5P.newRunnable(this.options.action, Options.contentId);

      this.instance.on('xAPI', function (event) {
        var stmt = event.data.statement;
        var isParent = (stmt.context.contextActivities.parent === undefined);

        if (isParent && stmt.result !== undefined && stmt.result.completion === true) {
          self.score = event.getScore();
          self.headerButton.continue();
        }
      });
    }

    return this.instance;
  }

  getMachineName() {
    return this.machineName;
  }

  getHeader() {
    return this.options.header;
  }

  getIntro() {
    return this.options.intro;
  }
}
