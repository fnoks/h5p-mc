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

    this.$container = $container;
    this.currentPopupClass;

    // The semi-transparent background
    this.$popupBg = $('<div>', {
      'class': 'h5p-mini-course-popup-bg',
      zIndex: popupZIndex
    });

    // the popup container
    this.$popup = $('<div>', {
      'class': 'h5p-mini-course-popup' /* + machineName*/
    }).appendTo(this.$popupBg);

    // The close button
    $('<div>', {
      'class': 'h5p-mini-course-popup-close',
      click: this.hide
    }).appendTo(this.$popup);
  }

  show($elements, popupClass) {
    $elements.forEach(($element) => {
      this.$popup.append($element);
    });
    if (popupClass) {
      this.$popup.addClass(popupClass);
      this.currentPopupClass = popupClass;
    }

    this.$container.append(this.$popupBg);
    this.$popupBg.addClass('visible');

    setTimeout(() => {
      this.$popup.addClass('visible');
    }, 200);
  }

  replace($elements, popupClass) {
    this.$popup.removeClass('visible');

    setTimeout(() => {
      this.$popup.children().detach();

      $elements.forEach(($element) => {
        this.$popup.append($element);
      });

      if (popupClass) {
        this.$popup.addClass(popupClass);
        this.currentPopupClass = popupClass;
      }

      this.$popup.addClass('visible');
    }, 600);

    //this.$container.append(this.$popupBg);
    //this.$popupBg.addClass('visible');

    //setTimeout(() => {this.$popup.addClass('visible')}, 200);
  }

  hide() {
    this.$popup.removeClass('visible');
    this.$popupBg.removeClass('visible');

    setTimeout(() => {
      if (this.currentPopupClass) {
        this.$popup.removeClass(this.currentPopupClass);
        this.currentPopupClass = undefined;
      }
      this.$popup.children().detach();
      this.$popupBg.detach();

    }, 1000);
  }

  getDomElement() {
    return this.$popup;
  }
}
