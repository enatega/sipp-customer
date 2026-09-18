import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme';
import Text from '../Text';
import PressableScale from '../PressableScale';
import { POPULAR_ADDRESSES, type PopularAddress } from '../../data/popularAddresses';

type Props = {
  onSelect: (place: PopularAddress) => void;
  disabled?: boolean;
};

export default function PopularAddressChips({ onSelect, disabled = false }: Props) {
  const { colors, shape, spacing } = useTheme();
  const { t } = useTranslation('general');

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.md }]}>
      <Text variant="caption" weight="semiBold" color={colors.mutedText} style={styles.label}>
        {t('address_popular_places')}
      </Text>
      <View style={styles.chipsWrap}>
        {POPULAR_ADDRESSES.map((place) => (
          <PressableScale
            accessibilityRole="button"
            disabled={disabled}
            key={place.name}
            onPress={() => onSelect(place)}
            style={[
              styles.chip,
              {
                borderColor: colors.primary,
                borderRadius: shape.radius.pill,
                opacity: disabled ? 0.6 : 1,
              },
            ]}
          >
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text variant="caption" weight="semiBold" color={colors.text} style={styles.chipLabel}>
              {place.name}
            </Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipLabel: { marginLeft: 6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  label: { marginBottom: 8, marginTop: 12 },
  row: {},
});
