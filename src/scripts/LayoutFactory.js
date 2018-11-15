import GridLayout from './layouts/GridLayout';
import LinearLayout from './layouts/LinearLayout';
import SlideLayout from './layouts/SlideLayout';

import Options from './Options';

const layoutMap = {
  'linear': LinearLayout,
  'grid': GridLayout,
  'pages': SlideLayout
}

export default class LayoutFactory {
  static getLayoutEngine() {
    const engineClass = layoutMap[Options.get('layoutEngine')];
    return new engineClass;
  }
}
