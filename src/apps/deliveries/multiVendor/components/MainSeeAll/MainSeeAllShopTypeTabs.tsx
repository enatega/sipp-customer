import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryShopType } from '../../../api/types';
import PressableScale from '../../../../../general/components/PressableScale';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTranslation } from 'react-i18next';

type Props = {
  items: DeliveryShopType[];
  selectedShopTypeId: string | null;
  onSelectShopType: (shopTypeId: string | null) => void;
};

function decodeDisplayText(value: string) {
  let decodedValue = value;

  if (decodedValue.includes('%')) {
    try {
      decodedValue = decodeURIComponent(decodedValue);
    } catch {
      decodedValue = value;
    }
  }

  return decodedValue.replace(/%amp;|&amp;|&#38;/gi, '&');
}

export default function MainSeeAllShopTypeTabs({
  items,
  selectedShopTypeId,
  onSelectShopType,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView
        horizontal
        contentContainerStyle={[
          styles.content,
          { gap: spacing.sm, paddingHorizontal: gutter, paddingVertical: spacing.sm },
        ]}
        showsHorizontalScrollIndicator={false}
      >
        <PressableScale
          accessibilityLabel={t('home_all_stores')}
          accessibilityRole="tab"
          accessibilityState={{ selected: !selectedShopTypeId }}
          onPress={() => onSelectShopType(null)}
          pressedScale={0.97}
          style={[styles.tab, { backgroundColor: !selectedShopTypeId ? colors.primary : colors.surfaceSunken, borderRadius: shape.radius.pill, paddingHorizontal: spacing.lg }]}
        >
          <Text color={!selectedShopTypeId ? colors.onPrimary : colors.textSubtle} variant="label" weight={!selectedShopTypeId ? 'semiBold' : 'medium'}>
            {t('home_all_stores')}
          </Text>
        </PressableScale>
        {items.map((shopType) => {
          const isSelected = selectedShopTypeId === shopType.id;
          const resolvedShopTypeName = decodeDisplayText(shopType.name);

          return (
            <PressableScale
              accessibilityLabel={resolvedShopTypeName}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              key={shopType.id}
              onPress={() => onSelectShopType(shopType.id)}
              pressedScale={0.97}
              style={[
                styles.tab,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceSunken,
                  borderRadius: shape.radius.pill,
                  paddingHorizontal: spacing.lg,
                },
              ]}
            >
              <Text
                color={isSelected ? colors.onPrimary : colors.textSubtle}
                variant="label"
                weight={isSelected ? 'semiBold' : 'medium'}
              >
                {resolvedShopTypeName}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  content: {
    minWidth: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
