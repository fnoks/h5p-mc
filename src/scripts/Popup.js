const $ = H5P.jQuery;

export default class Popup extends H5P.EventDispatcher {

  /**
   * Setup new popup instance.
   * @param {jQuery} Container to attach popup to.
   */
  static setup($container) {
    Popup.instance = new Popup(100, $container);
  }

  /**
   * Get popup instance. Needs to have been instantiated.
   */
  static getInstance() {
    return Popup.instance;
  }

  /**
   * @constructor
   * @param {number} popupZIndex Z index for popup.
   * @param {jQuery} $container Container to attach popup to.
   */
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

  /**
   * Show popup.
   * @param {jQuery[]} $elements Elements to attach to popup.
   * @param {string} popupClass Style class name.
   */
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

  /**
   * Replace elements in popup. Will remove all current elements.
   * @param {jQuery[]} $elements Elements to set in popup.
   * @param {string} popupClass Style class name.
   */
  replace($elements, popupClass) {
    this.$popup.removeClass('visible');

    clearTimeout(this.popupTimeout);
    this.popupTimeout = setTimeout(() => {
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

  /**
   * Hide popup.
   */
  hide() {
    this.$popup.removeClass('visible');
    this.$popupBg.removeClass('visible');

    clearTimeout(this.popupTimeout);
    this.popupTimeout = setTimeout(() => {
      if (this.currentPopupClass) {
        this.$popup.removeClass(this.currentPopupClass);
        this.currentPopupClass = undefined;
      }
      this.$popup.children().detach();
      this.$popupBg.detach();

    }, 1000);
  }

  /**
   * Get DOM element for popup.
   * @return {jQuery} DOM element for popup.
   */
  getDomElement() {
    return this.$popup;
  }
}
