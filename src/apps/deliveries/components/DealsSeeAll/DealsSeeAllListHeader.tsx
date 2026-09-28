import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryDealsTabType } from '../../api/dealsServiceTypes';

type Props = {
  isTabsVisible?: boolean;
  onTabChange: (tab: DeliveryDealsTabType) => void;
  selectedTab: DeliveryDealsTabType;
  title: string;
};

export default function DealsSeeAllListHeader({ isTabsVisible = true, onTabChange, selectedTab, title }: Props) {
  const { colors, shape } = useTheme();
  const { t } = useTranslation('deliveries');
  const tabs: Array<{ key: DeliveryDealsTabType; label: string }> = [
    { key: 'all', label: t('deals_see_all_tab_all') },
    { key: 'limited', label: t('deals_see_all_tab_limited') },
    { key: 'weekly', label: t('deals_see_all_tab_weekly') },
  ];

  return (
    <View style={styles.container}>
      {isTabsVisible ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => {
            const selected = tab.key === selectedTab;
            return (
              <PressableScale
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={tab.label}
                onPress={() => onTabChange(tab.key)}
                style={[styles.tab, { backgroundColor: selected ? colors.primary : colors.surfaceSunken, borderRadius: shape.radius.pill }]}
              >
                <Text color={selected ? colors.onPrimary : colors.textSubtle} variant="label" weight={selected ? 'semiBold' : 'medium'}>{tab.label}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      ) : null}
      <Text accessibilityRole="header" color={colors.textStrong} variant="sectionTitle" weight="bold">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 16, paddingTop: 16 },
  tabs: { gap: 8, paddingRight: 16 },
  tab: { alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: 16 },
});
