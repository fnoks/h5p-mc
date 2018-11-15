import PopupLayout from './PopupLayout';

const $ = H5P.jQuery;

export default class LinearLayout extends PopupLayout {
  constructor() {
    super();

    this.$container = $('<div>', {
      'class': 'h5p-linear-layout timeline-container containerBlock'
    });
  }

  add(courseUnit) {

    const $unit = $(`<div class="timeline-item large-margin-tb">
      <div class="content-r title-block medium-title animate-appear">${courseUnit.getHeader()}</div>
      <div class="content-dot animate-scale-dot"></div>
      <div class="content-l content-block frame animate-appear">
        <span class="medium-body">${courseUnit.getIntro()}</span>
        <a href="https://h5p.org/july-2018-release-note" class="button">Open</a><span class="content-tip frame-tip-l"></span>
      </div>

    </div>`).appendTo(this.$container);

    super.add(courseUnit);
  }

  getElement() {
    return this.$container;
  }

  enable() {

  }

  resize() {

  }
}
