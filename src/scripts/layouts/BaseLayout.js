export default class BaseLayout extends H5P.EventDispatcher {


  constructor() {
    super();

    this.courseUnits = [];
    this.maxScore = 0;
  }

  add(courseUnit) {
    this.courseUnits.push(courseUnit);
    this.maxScore += courseUnit.getMaxScore();

    /* Move away from layout */
    /*if (options.behaviour.forceSequential === false) {
      courseUnit.enable();
    }*/

    courseUnit.enable();
  }

  getMaxScore() {
    return this.maxScore;
  }
}
