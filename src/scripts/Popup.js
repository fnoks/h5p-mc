const $ = H5P.jQuery;

export default class Popup extends H5P.EventDispatcher {

  static setup($container) {
    Popup.instance = new Popup(100, $container);
  }

  static getInstance() {
    return Popup.instance;
  }

  constructor(popupZIndex, $container) {
    super();

    const self = this;
    let currentPopupClass;

    // The semi-transparent background
    const $popupBg = $('<div>', {
      'class': 'h5p-mini-course-popup-bg',
      zIndex: popupZIndex
    });

    // the popup container
    const $popup = $('<div>', {
      'class': 'h5p-mini-course-popup' /* + machineName*/
    }).appendTo($popupBg);

    self.show = function ($elements, popupClass) {
      $elements.forEach(function ($element) {
        $popup.append($element);
      });
      if (popupClass) {
        $popup.addClass(popupClass);
        currentPopupClass = popupClass;
      }

      $container.append($popupBg);
      $popupBg.addClass('visible');

      setTimeout(function () {
        $popup.addClass('visible');
      }, 200);
    };

    self.replace = function ($elements, popupClass) {
      $popup.removeClass('visible');

      setTimeout(() => {
        $popup.children().detach();

        $elements.forEach(function ($element) {
          $popup.append($element);
        });

        if (popupClass) {
          $popup.addClass(popupClass);
          currentPopupClass = popupClass;
        }

        $popup.addClass('visible');
      }, 600);

      //$container.append($popupBg);
      //$popupBg.addClass('visible');

      //setTimeout(() => {$popup.addClass('visible')}, 200);
    };

    self.hide = function () {
      $popup.removeClass('visible');
      $popupBg.removeClass('visible');

      setTimeout(function () {
        if (currentPopupClass) {
          $popup.removeClass(currentPopupClass);
          currentPopupClass = undefined;
        }
        $popup.children().detach();
        $popupBg.detach();

      }, 1000);
    };

    self.getDomElement = () => {return $popup};

    // The close button
    $('<div>', {
      'class': 'h5p-mini-course-popup-close',
      click: self.hide.bind(this)
    }).appendTo($popup);
  }
}
