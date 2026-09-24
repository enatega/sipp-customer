import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { SupportTicketFilter } from '../../utils/supportTicketMappers';

const FILTERS: { labelKey: string; value: SupportTicketFilter }[] = [
  { labelKey: 'support_tickets_filter_all', value: 'all' },
  { labelKey: 'support_tickets_filter_active', value: 'active' },
  { labelKey: 'support_tickets_filter_closed', value: 'closed' },
];

type Props = {
  filter: SupportTicketFilter;
  onFilterChange: (filter: SupportTicketFilter) => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
};

export default function SupportTicketsToolbar({
  filter,
  onFilterChange,
  onSearchChange,
  searchValue,
}: Props) {
  const { colors, shape, spacing, typography } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={[
          styles.searchField,
          {
            backgroundColor: colors.backgroundTertiary,
            borderRadius: shape.radius.control,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <Ionicons color={colors.mutedText} name="search-outline" size={20} />
        <TextInput
          accessibilityLabel={t('support_tickets_search_action')}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onSearchChange}
          placeholder={t('support_tickets_search_placeholder')}
          placeholderTextColor={colors.mutedText}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text, fontSize: typography.size.md }]}
          value={searchValue}
        />
        {searchValue.length > 0 ? (
          <Pressable
            accessibilityLabel={t('support_tickets_search_clear')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onSearchChange('')}
          >
            <Ionicons color={colors.mutedText} name="close-circle" size={20} />
          </Pressable>
        ) : null}
      </View>

      <View accessibilityRole="tablist" style={[styles.filters, { gap: spacing.sm }]}>
        {FILTERS.map((option) => {
          const isSelected = option.value === filter;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onPress={() => onFilterChange(option.value)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.backgroundTertiary,
                  borderRadius: shape.radius.pill,
                  paddingHorizontal: spacing.lg,
                },
              ]}
            >
              <Text
                color={isSelected ? colors.onPrimary : colors.text}
                variant="caption"
                weight="semiBold"
              >
                {t(option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  filters: {
    flexDirection: 'row',
  },
  searchField: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    padding: 0,
  },
});
