const $ = H5P.jQuery;

const progressTemplate = '<div class="radial-progress" data-progress="0">' +
    '<div class="circle">' +
      '<div class="mask full">' +
      '	<div class="fill"></div>' +
      '</div>' +
      '<div class="mask half">' +
      '	<div class="fill"></div>' +
      '	<div class="fill fix"></div>' +
      '</div>' +
      '<div class="shadow"></div>' +
    '</div>' +
    '<div class="inset"></div>' +
  '</div>';

export default class ProgressCircle {

  constructor(totalScore, label, showTotal) {
    this.totalScore = totalScore;
    this.label = label;
    this.showTotal = showTotal;

    this.currentScore = 0;
  }

  setCurrent(newScore) {
    this.currentScore = newScore;
    this.updateUI();
  }

  increment(score) {
    this.currentScore += (typeof score === 'number') ? score : 1;
    this.updateUI();
  }

  reset() {
    this.currentScore = 0;
    this.updateUI();
  }

  getScore() {
    return this.currentScore;
  }

  appendTo($container) {
    this.$container = $container;

    this.$container.append(progressTemplate);

    // Create label:
    this.$container.append($('<div>', {
      'class': 'h5p-progress-circle-label',
      /*'aria-hidden': true,*/
      text: this.label
    }));

    // Create textual representation of score/progress
    this.$textualProgress = $('<div>', {
      'class': 'h5p-progress-circle-textual-progress'
    });

    this.$container.append(this.$textualProgress);

    this.$progress = $container.find('.radial-progress');
    this.$fullAndFill = $container.find('.circle .mask.full, .circle .fill');
    this.$fillFix = $container.find('.circle .fill.fix');

    this.updateUI();
  }

  updateUI() {
    if (this.currentScore > this.totalScore) {
      this.currentScore = this.totalScore;
    }

    const k = Math.ceil((this.currentScore / this.totalScore) * 100) * 1.8;

    this.$fullAndFill.css('transform', 'rotate(' + k + 'deg)');
    this.$fillFix.css('transform', 'rotate(' + (k * 2) + 'deg)');
    this.$textualProgress.html(this.currentScore + '<span class="h5p-progress-circle-textual-progress-divider">/</span>' + this.totalScore);

    //this.$text.attr('aria-valuenow', currentScore);
  }
}
