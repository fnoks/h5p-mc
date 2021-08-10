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
   * Retrieve current score.
   * @return {number} Current score.
   */
  getScore() {
    return this.courseUnits.reduce((score, unit) => {
      return score + unit.getScore();
    }, 0);
  }

  /**
   * Get maximum achievable score.
   * @return {number} Maximum achievable score.
   */
  getMaxScore() {
    return this.maxScore;
  }

  /**
   * Retrieve xAPI data of children with scoring.
   * @return {object[]} XAPI data of children with scoring.
   */
  getXAPIChildrenData() {
    return this.courseUnits
      .map((unit) => {
        return (typeof unit.getInstance().getXAPIData === 'function') ?
          unit.getInstance().getXAPIData() :
          false;
      })
      .filter((unit) => unit !== false);
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


    if (Options.all().behaviour.forceSequential) {
      // Enable first unit only
      this.enable(0);
    }
    else {
      this.courseUnits.forEach((unit) => {
        unit.enable();
      });
    }
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

    const unitsCompleted = this.courseUnits.reduce((sum, unit) => {
      return sum + (unit.completed ? 1 : 0);
    }, 0);

    this.trigger('progress', {
      index: unitsCompleted
    });

    if (unitsCompleted === this.getLessonCount()) {
      this.trigger('finished');
    }
    else {
      if (Options.all().behaviour.forceSequential) {
        this.activeElement++;
        this.enable(this.activeElement);
      }
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
