import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../general/theme/theme';
import { DELIVERIES_TAB_BAR_SAFE_PADDING } from '../components/navigation/DeliveriesTabBar';

export default function useDeliveriesTabSheetOffset() {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme();

  return tabBarHeight
    + Math.max(insets.bottom, DELIVERIES_TAB_BAR_SAFE_PADDING)
    + spacing.sm;
}
