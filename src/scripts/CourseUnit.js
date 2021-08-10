import Options from './Options';

const scorables = [
  "H5P.ImageHotspotQuestion",
  "H5P.Blanks",
  "H5P.SingleChoiceSet",
  "H5P.MultiChoice",
  "H5P.TrueFalse",
  "H5P.DragQuestion",
  "H5P.Summary",
  "H5P.DragText",
  "H5P.MarkTheWords",
  "H5P.MemoryGame",
  "H5P.QuestionSet",
  "H5P.InteractiveVideo",
  "H5P.CoursePresentation",
  "H5P.Flashcards"
];

export default class CourseUnit extends H5P.EventDispatcher {

  /**
   * @constructor
   * @param {object} options Options.
   * @param {number} index Unit index.
   */
  constructor(options, index) {
    super();

    this.index = index;
    this.enabled = false;

    this.options = options;

    const libraryMeta = H5P.libraryFromString(options.action.library);

    this.machineName = libraryMeta.machineName;
    this.className = this.machineName.toLowerCase().replace('.', '-');
  }

  /**
   * Get content instance.
   * @return {H5P.ContentType} Content type instance.
   */
  getInstance() {
    if (this.instance === undefined) {
      this.instance = H5P.newRunnable(this.options.action, Options.contentId);

      this.instance.on('xAPI', event => {
        const stmt = event.data.statement;
        const isParent = (stmt.context.contextActivities.parent === undefined);
        if (isParent && stmt.result !== undefined && stmt.result.completion === true &&
            stmt.result.score !== undefined && stmt.result.score.scaled !== undefined) {

          this.score = stmt.result.score.scaled * this.getMaxScore();

          this.trigger('scored', {
            index: this.index,
            maxScore: this.getMaxScore(),
            score: this.score,
            header: this.getHeader()
          });
        }
      });
    }

    return this.instance;
  }

  /**
   * Reset course unit.
   */
  reset() {
    if (this.instance && this.instance.resetTask) {
      //this.instance.resetTask();
    }
    this.instance = undefined;
  }

  /**
   * Check whether a score was set.
   * @return {boolean} True, if score is not 0. Else false.
   */
  hasScore() {
    if (scorables.indexOf(this.getMachineName()) !== -1) {
      return (this.options.maxScore !== 0);
    }

    return false;
  }

  /**
   * Get current score.
   * @return {number} Current score.
   */
  getScore() {
    return this.score || 0;
  }

  /**
   * Get maximum score achievable.
   * @return {number} Maximum score achievable.
   */
  getMaxScore() {
    return this.options.maxScore || 0;
  }

  /**
   * Get H5P machine name.
   * @return {string} H5P machine name.
   */
  getMachineName() {
    return this.machineName;
  }

  /**
   * Get class name.
   * @return {string} Class name.
   */
  getClassName() {
    return this.className;
  }

  /**
   * Get unit header text.
   * @return {string} Unit header text.
   */
  getHeader() {
    return this.options.header;
  }

  /**
   * Get unit introduction text.
   * @return {string} Unit introduction text.
   */
  getIntro() {
    return this.options.intro;
  }

  /**
   * Resize unit.
   */
  resize() {
    if (this.instance) {
      this.instance.trigger('resize');
    }
  }
}
