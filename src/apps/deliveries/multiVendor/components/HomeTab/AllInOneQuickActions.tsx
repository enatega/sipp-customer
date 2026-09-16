import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';

export type HomeQuickActionId = 'browse' | 'deals' | 'orders' | 'favourites';

type QuickAction = {
  id: HomeQuickActionId;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
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

const ACTIONS: QuickAction[] = [
  {
    id: 'browse',
    icon: 'storefront-outline',
    labelKey: 'multi_vendor_home_quick_browse',
    foreground: 'quickActionBrowseForeground',
    surface: 'quickActionBrowseSurface',
  },
  {
    id: 'deals',
    icon: 'tag-outline',
    labelKey: 'multi_vendor_home_quick_deals',
    foreground: 'quickActionDealsForeground',
    surface: 'quickActionDealsSurface',
  },
  {
    id: 'orders',
    icon: 'history',
    labelKey: 'multi_vendor_home_quick_orders',
    foreground: 'quickActionOrdersForeground',
    surface: 'quickActionOrdersSurface',
  },
  {
    id: 'favourites',
    icon: 'heart-outline',
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
  const { colors, layout, shape, spacing } = useTheme();
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
      {ACTIONS.map((action) => (
        <PressableScale
          accessibilityLabel={t(action.labelKey)}
          accessibilityRole="button"
          key={action.id}
          onPress={() => onActionPress(action.id)}
          pressedScale={0.96}
          style={[
            styles.action,
            {
              backgroundColor: colors[action.surface],
              borderColor: colors.divider,
              borderRadius: shape.radius.surface,
              gap: spacing.sm,
              paddingHorizontal: spacing.xs,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.iconSurface,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: shape.radius.control,
              },
            ]}
          >
            <MaterialCommunityIcons
              color={colors[action.foreground]}
              name={action.icon}
              size={24}
            />
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
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 104,
    minWidth: 0,
  },
  iconSurface: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  label: {
    minHeight: 32,
    textAlign: 'center',
  },
  row: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
  },
});
