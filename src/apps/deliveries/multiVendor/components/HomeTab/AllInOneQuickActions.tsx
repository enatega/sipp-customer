import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';

export type HomeQuickActionId = 'browse' | 'deals' | 'orders' | 'favourites';

type Props = { onActionPress: (actionId: HomeQuickActionId) => void };

const ACTIONS: Array<{ id: HomeQuickActionId; labelKey: string; icon: keyof typeof Ionicons.glyphMap; surface: 'quickActionBrowseSurface' | 'quickActionDealsSurface' | 'quickActionOrdersSurface' | 'quickActionFavouritesSurface'; foreground: 'quickActionBrowseForeground' | 'quickActionDealsForeground' | 'quickActionOrdersForeground' | 'quickActionFavouritesForeground' }> = [
  { id: 'browse', labelKey: 'multi_vendor_home_quick_browse', icon: 'storefront-outline', surface: 'quickActionBrowseSurface', foreground: 'quickActionBrowseForeground' },
  { id: 'deals', labelKey: 'multi_vendor_home_quick_deals', icon: 'pricetag-outline', surface: 'quickActionDealsSurface', foreground: 'quickActionDealsForeground' },
  { id: 'orders', labelKey: 'multi_vendor_home_quick_orders', icon: 'repeat-outline', surface: 'quickActionOrdersSurface', foreground: 'quickActionOrdersForeground' },
  { id: 'favourites', labelKey: 'multi_vendor_home_quick_favourites', icon: 'heart-outline', surface: 'quickActionFavouritesSurface', foreground: 'quickActionFavouritesForeground' },
];

export default function AllInOneQuickActions({ onActionPress }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, elevation, layout, shape } = useTheme();
  const { gutter } = useWindowClass();

  return (
    <View style={[styles.section, { maxWidth: layout.contentMaxWidth.commerce, paddingHorizontal: gutter }]}>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <PressableScale
            accessibilityLabel={t(action.labelKey)}
            accessibilityRole="button"
            key={action.id}
            onPress={() => onActionPress(action.id)}
            pressedScale={0.97}
            style={[styles.action, { backgroundColor: colors[action.surface], borderColor: colors.border, borderRadius: shape.radius.surface }]}
          >
            <View style={[styles.iconPlate, elevation.subtle, { backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.surface }]}>
              <Ionicons name={action.icon} size={25} color={colors[action.foreground]} />
            </View>
            <Text color={colors.textStrong} numberOfLines={2} variant="label" weight="semiBold" style={styles.label}>{t(action.labelKey)}</Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignSelf: 'center', width: '100%' },
  grid: { flexDirection: 'row', gap: 8 },
  action: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: 9, justifyContent: 'center', minHeight: 108, minWidth: 0, paddingHorizontal: 4, paddingVertical: 10 },
  iconPlate: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  label: { fontSize: 12, lineHeight: 15, textAlign: 'center' },
});
