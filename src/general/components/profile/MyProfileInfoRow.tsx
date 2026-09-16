import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../Text';
import PressableScale from '../PressableScale';
import { useTheme } from '../../theme/theme';

type Props = {
  label: string;
  value: string | null | undefined;
  isEditable?: boolean;
  editLabel?: string;
  onEdit?: () => void;
};

export default function MyProfileInfoRow({
  label,
  value,
  isEditable = false,
  editLabel,
  onEdit,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowHeader}>
        <Text weight="bold" style={styles.infoLabel}>
          {label}
        </Text>
        {isEditable && editLabel ? (
          <PressableScale
            onPress={onEdit}
            accessibilityRole="button"
            style={[styles.editButton, { backgroundColor: colors.primarySoft }]}
          >
            <Text weight="bold" color={colors.primary} style={styles.editText}>
              {editLabel}
            </Text>
          </PressableScale>
        ) : null}
      </View>
      <Text weight="medium" color={colors.mutedText} style={styles.infoValue}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoLabel: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoRow: {
    gap: 4,
    minHeight: 48,
    justifyContent: 'center',
  },
  infoRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoValue: {
    fontSize: 12,
    lineHeight: 18,
  },
});
