import { useWindowDimensions } from 'react-native';
import { layout } from '../theme/layout';

export type WindowClass = 'compact' | 'medium' | 'expanded';

export function useWindowClass() {
  const { width, height, fontScale } = useWindowDimensions();
  const windowClass: WindowClass = width <= layout.breakpoint.compactMax
    ? 'compact'
    : width <= layout.breakpoint.mediumMax
      ? 'medium'
      : 'expanded';

  return {
    width,
    height,
    fontScale,
    windowClass,
    isCompact: windowClass === 'compact',
    isMedium: windowClass === 'medium',
    isExpanded: windowClass === 'expanded',
    gutter: layout.gutter[windowClass],
  } as const;
}
