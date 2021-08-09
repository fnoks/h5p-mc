import Options from '../Options';

export default class BaseLayout extends H5P.EventDispatcher {
  constructor() {
    super();

    this.courseUnits = [];
    this.maxScore = 0;
    this.activeElement = 0;
  }

  add(courseUnit) {
    this.courseUnits.push(courseUnit);
    this.maxScore += courseUnit.getMaxScore();

    courseUnit.on('scored', (event) => {
      this.trigger('scored', event.data);

      // Change from skip to continue:
      this.canContinue();
    });

    if (this.courseUnits.length === 1 || !Options.all().behaviour.forceSequential) {
      courseUnit.enable();
    }
  }

  getMaxScore() {
    return this.maxScore;
  }

  goFullscreen() {
    //const parentHeight = this.$grid.parent().height();
    const gridHeight = this.$container.height();
    this.$container.css('height', `${gridHeight}px`);
  }

  reset() {
    // Reset all units
    this.courseUnits.forEach((unit) => {
      unit.reset();
    });

    this.activeElement = 0;

    // Enable first unit:
    this.enable(0);
  }

  enable(index) {
    if (index < this.getLessonCount()) {
      this.courseUnits[index].enable();
    }
  }

  getLessonCount() {
    return this.courseUnits.length;
  }

  enableNext() {
    this.courseUnits[this.activeElement].done();
    this.trigger('progress', {
      index: this.activeElement + 1
    });

    if (!this.isLastLesson()) {
      this.activeElement++;
      this.enable(this.activeElement);
    }
    else {
      this.trigger('finished');
    }
  }

  isLastLesson() {
    return this.activeElement + 1 >= this.getLessonCount();
  }

  resize() {
    this.courseUnits.forEach(unit => unit.resize());
  }
}
