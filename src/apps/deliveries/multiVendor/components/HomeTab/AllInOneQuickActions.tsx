import React from 'react';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import QuickActionDealsIcon from './quickActionIcons/QuickActionDealsIcon';
import QuickActionHeartIcon from './quickActionIcons/QuickActionHeartIcon';
import QuickActionReorderIcon from './quickActionIcons/QuickActionReorderIcon';
import QuickActionStoreIcon from './quickActionIcons/QuickActionStoreIcon';
import type { QuickActionIconProps } from './quickActionIcons/types';

export type HomeQuickActionId = 'browse' | 'deals' | 'orders' | 'favourites';

type QuickAction = {
  id: HomeQuickActionId;
  Icon: ComponentType<QuickActionIconProps>;
  labelKey: string;
  foreground:
    | 'quickActionBrowseForeground'
    | 'quickActionDealsForeground'
    | 'quickActionOrdersForeground'
    | 'quickActionFavouritesForeground';
  surface:
    | 'quickActionBrowseSurface'
    | 'quickActionDealsSurface'
    | 'quickActionOrdersSurface'
    | 'quickActionFavouritesSurface';
};

const ICON_SIZE = 52;
const PEDESTAL_SIZE = 68;

const ACTIONS: QuickAction[] = [
  {
    id: 'browse',
    Icon: QuickActionStoreIcon,
    labelKey: 'multi_vendor_home_quick_browse',
    foreground: 'quickActionBrowseForeground',
    surface: 'quickActionBrowseSurface',
  },
  {
    id: 'deals',
    Icon: QuickActionDealsIcon,
    labelKey: 'multi_vendor_home_quick_deals',
    foreground: 'quickActionDealsForeground',
    surface: 'quickActionDealsSurface',
  },
  {
    id: 'orders',
    Icon: QuickActionReorderIcon,
    labelKey: 'multi_vendor_home_quick_orders',
    foreground: 'quickActionOrdersForeground',
    surface: 'quickActionOrdersSurface',
  },
  {
    id: 'favourites',
    Icon: QuickActionHeartIcon,
    labelKey: 'multi_vendor_home_quick_favourites',
    foreground: 'quickActionFavouritesForeground',
    surface: 'quickActionFavouritesSurface',
  },
];

type Props = {
  onActionPress: (actionId: HomeQuickActionId) => void;
};

export default function AllInOneQuickActions({ onActionPress }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { gutter } = useWindowClass();

  return (
    <View
      accessibilityRole="toolbar"
      style={[
        styles.row,
        {
          gap: spacing.sm,
          maxWidth: layout.contentMaxWidth.commerce,
          paddingHorizontal: gutter,
        },
      ]}
    >
      {ACTIONS.map(({ Icon, ...action }) => (
        <PressableScale
          accessibilityLabel={t(action.labelKey)}
          accessibilityRole="button"
          key={action.id}
          onPress={() => onActionPress(action.id)}
          pressedScale={0.96}
          style={[
            styles.action,
            elevation.subtle,
            { backgroundColor: colors.surface, borderRadius: shape.radius.surface },
          ]}
        >
          <LinearGradient
            colors={[colors[action.surface], colors.surface]}
            end={{ x: 0.5, y: 1 }}
            start={{ x: 0.5, y: 0 }}
            style={[
              styles.gradient,
              {
                borderColor: colors.divider,
                borderRadius: shape.radius.surface,
                gap: spacing.xs,
                paddingBottom: spacing.md,
                paddingHorizontal: spacing.xs,
                paddingTop: spacing.sm,
              },
            ]}
          >
            <View style={styles.iconStage}>
              <View
                style={[
                  styles.pedestal,
                  { backgroundColor: colors.surfaceElevated },
                ]}
              />
              <Icon size={ICON_SIZE} />
            </View>
            <Text
              color={colors[action.foreground]}
              numberOfLines={2}
              style={styles.label}
              variant="caption"
              weight="bold"
            >
              {t(action.labelKey)}
            </Text>
          </LinearGradient>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    minWidth: 0,
  },
  gradient: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 116,
    overflow: 'hidden',
  },
  label: {
    minHeight: 32,
    textAlign: 'center',
  },
  iconStage: {
    alignItems: 'center',
    height: PEDESTAL_SIZE,
    justifyContent: 'center',
    width: PEDESTAL_SIZE,
  },
  pedestal: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: PEDESTAL_SIZE / 2,
    opacity: 0.85,
  },
  row: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
  },
});
