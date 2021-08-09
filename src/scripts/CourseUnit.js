import Dictionary from './Dictionary';
import Options from './Options';

const $ = H5P.jQuery;

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

  constructor(options, index) {
    super();

    this.index = index;
    this.enabled = false;

    this.options = options;

    const libraryMeta = H5P.libraryFromString(options.action.library);

    this.machineName = libraryMeta.machineName;
    this.className = this.machineName.toLowerCase().replace('.', '-');
  }

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

  reset() {
    if (this.instance && this.instance.resetTask) {
      //this.instance.resetTask();
    }
    this.instance = undefined;
  }

  hasScore() {
    if (scorables.indexOf(this.getMachineName()) !== -1) {
      return (this.options.maxScore !== 0);
    }

    return false;
  }

  getMaxScore() {
    return this.options.maxScore || 0;
  }

  getMachineName() {
    return this.machineName;
  }

  getClassName() {
    return this.className;
  }

  getHeader() {
    return this.options.header;
  }

  getIntro() {
    return this.options.intro;
  }

  resize() {
    if (this.instance) {
      this.instance.trigger('resize');
    }
  }
}
