import GridLayout from './layouts/GridLayout';
import LinearLayout from './layouts/LinearLayout';

export default class LayoutFactory {
  static getLayoutEngine() {
    return new GridLayout;
  }
}
