import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import SearchInput from '../../../../general/components/search/SearchInput';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { resetToSharedRoute } from '../../../../general/navigation/rootNavigation';

type Props = {
  title: string;
  searchValue: string;
  onSearchChangeText: (value: string) => void;
  onOpenFilters?: () => void;
  showFilters?: boolean;
  searchPlaceholder?: string;
};

export default function DiscoveryListingHeader({
  title,
  searchValue,
  onSearchChangeText,
  onOpenFilters,
  showFilters = true,
  searchPlaceholder,
}: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('general');
  const { t: tDeliveries } = useTranslation('deliveries');

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    resetToSharedRoute('Deliveries', {
      screen: 'MultiVendor',
      params: { screen: 'MultiVendorTabs', params: { screen: 'MultiVendorTabHome' } },
    });
  };

  return (
    <View style={[styles.surface, { backgroundColor: colors.background, borderBottomColor: colors.divider, paddingTop: insets.top }]}>
      <View style={[styles.content, { maxWidth: layout.contentMaxWidth.expanded, paddingHorizontal: gutter, paddingBottom: spacing.sm }]}>
        <View style={styles.titleRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('see_all_back_label')} onPress={goBack} style={[styles.back, { backgroundColor: colors.surfaceSunken }]}>
            <Ionicons name="arrow-back" size={21} color={colors.textStrong} />
          </Pressable>
          <Text accessibilityRole="header" color={colors.textStrong} variant="title" weight="bold" numberOfLines={1} style={styles.title}>{title}</Text>
          <View style={styles.back} />
        </View>
        <View style={styles.searchRow}>
          <SearchInput
            density="compact"
            surfaceElevation="subtle"
            value={searchValue}
            onChangeText={onSearchChangeText}
            placeholder={searchPlaceholder ?? tDeliveries('generic_list_search_placeholder')}
            style={styles.search}
          />
          {showFilters && onOpenFilters ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('see_all_open_filters_label')} onPress={onOpenFilters} style={[styles.filter, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="options-outline" size={21} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { borderBottomWidth: StyleSheet.hairlineWidth },
  content: { alignSelf: 'center', gap: 8, width: '100%' },
  titleRow: { alignItems: 'center', flexDirection: 'row', minHeight: 44 },
  back: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  title: { flex: 1, textAlign: 'center' },
  searchRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  search: { flex: 1, minWidth: 0 },
  filter: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
});
