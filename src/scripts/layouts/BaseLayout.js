import Options from '../Options';

export default class BaseLayout extends H5P.EventDispatcher {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.courseUnits = [];
    this.maxScore = 0;
    this.activeElement = 0;
  }

  /**
   * Add course unit.
   * @param {CourseUnit} courseUnit CourseUnit.
   */
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

  /**
   * Get maximum achievable score.
   * @return {number} Maximum achievable score.
   */
  getMaxScore() {
    return this.maxScore;
  }

  /**
   * Go to fullscreen.
   */
  goFullscreen() {
    //const parentHeight = this.$grid.parent().height();
    const gridHeight = this.$container.height();
    this.$container.css('height', `${gridHeight}px`);
  }

  /**
   * Reset all units.
   */
  reset() {
    // Reset all units
    this.courseUnits.forEach((unit) => {
      unit.reset();
    });

    this.activeElement = 0;

    // Enable first unit:
    this.enable(0);
  }

  /**
   * Enable particular unit.
   * @param {number} index Unit index.
   */
  enable(index) {
    if (index < this.getLessonCount()) {
      this.courseUnits[index].enable();
    }
  }

  /**
   * Count number of lessons.
   * @return {number} Number of lessons.
   */
  getLessonCount() {
    return this.courseUnits.length;
  }

  /**
   * Enable next lesson.
   */
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

  /**
   * Determine whether current lesson is last one.
   * @return {boolean} True, if current lesson is last. Else false.
   */
  isLastLesson() {
    return this.activeElement + 1 >= this.getLessonCount();
  }

  /**
   * Resize.
   */
  resize() {
    this.courseUnits.forEach(unit => unit.resize());
  }
}
