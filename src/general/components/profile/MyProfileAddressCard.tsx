import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import PressableScale from '../PressableScale';

type Props = {
  typeLabel: string;
  address: string | null | undefined;
  iconName: keyof typeof Ionicons.glyphMap;
  isDisabled?: boolean;
  isSelected?: boolean;
  isSelecting?: boolean;
  onPress?: () => void;
  onMenuPress?: () => void;
};

export default function MyProfileAddressCard({
  typeLabel,
  address,
  iconName,
  isDisabled = false,
  isSelected = false,
  isSelecting = false,
  onPress,
  onMenuPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={address || typeLabel}
      accessibilityState={{ busy: isSelecting, disabled: !onPress || isDisabled, selected: isSelected }}
      onPress={onPress}
      disabled={!onPress || isDisabled}
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? colors.primarySoft : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.backgroundTertiary }]}>
          <Ionicons name={iconName} size={20} color={colors.text} />
        </View>
        <View style={styles.textSection}>
          <Text weight="bold" style={styles.typeLabel}>
            {typeLabel}
          </Text>
          <Text
            weight="medium"
            color={colors.mutedText}
            style={styles.address}
            numberOfLines={2}
          >
            {address || '—'}
          </Text>
        </View>
        {isSelecting ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : onMenuPress ? (
          <PressableScale
            onPress={onMenuPress}
            accessibilityRole="button"
            accessibilityLabel={typeLabel}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.menuButton, { backgroundColor: colors.surfaceSunken }]}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={colors.mutedText} />
          </PressableScale>
        ) : isSelected ? (
          <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}> 
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  address: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40,
  },
  selectedBadge: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  textSection: {
    flex: 1,
    gap: 4,
  },
  typeLabel: {
    fontSize: 14,
    lineHeight: 22,
  },
});
