import he from 'he';

const DEFAULT_TRANSLATIONS = {
  lessonStartLabel: 'Start Lesson',
  lessonLockedLabel: 'Locked',
  lessonCompletedLabel: 'Lessons completed',
  skipLabel: 'Skip Lesson',
  continueLabel: 'Continue',
  maxScoreLabel: 'Max Score',
  scoreLabel: 'Your Score',
  youGotLabel: 'You Got',
  infoLessonLabel: 'Info Lesson',
  points: 'points',
  of: 'of',
  noScoreLabel: 'No Score',
  retryButtonLabel: 'Retry',
  quitUnitConfirmationHeader: 'Are you sure?',
  quitUnitConfirmationBody: 'If quitting this lesson, no score will be given.',
  openMiniCourse: 'Open mini course',
  summary: {
    header: 'You have completed the mini course!',
    overallResult: 'You won %score of %maxScore points!',
    lessonPrefixLabel: 'Lesson %lessonIndex',
    tryAgain: 'Try again',
    noScore: 'No score'
  }
};

export default class Dictionary {
  /**
   * Fill dictionary with translations.
   * @param {object} translation Translations.
   */
  static fill(translation) {
    translation = H5P.jQuery.extend(DEFAULT_TRANSLATIONS, translation);
    Dictionary.translation = Dictionary.sanitize(translation);
  }

  /**
   * Get translation for a key.
   * @param {string} key Key to look for.
   * @return {string} Translation.
   */
  static get(key) {
    return Dictionary.translation[key];
  }

  /**
   * Sanitize translations recursively: HTML decode and strip HTML.
   */
  static sanitize(translation) {
    if (typeof translation === 'object') {
      for (let key in translation) {
        translation[key] = Dictionary.sanitize(translation[key]);
      }
    }
    else if (typeof translation === 'string') {
      translation = he.decode(translation);
      const div = document.createElement('div');
      div.innerHTML = translation;
      translation = div.textContent || div.innerText || '';
    }
    else {
      // Invalid translation
    }

    return translation;
  }
}
