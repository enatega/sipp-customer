import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text';
import { useTheme } from '../../theme/theme';

type Props = {
  address: string | null | undefined;
  iconName: keyof typeof Ionicons.glyphMap;
  isDisabled?: boolean;
  isSelected?: boolean;
  isSelecting?: boolean;
  onPress: () => void;
  typeLabel: string;
};

export default function SavedAddressSelectionRow({
  address,
  iconName,
  isDisabled = false,
  isSelected = false,
  isSelecting = false,
  onPress,
  typeLabel,
}: Props) {
  const { colors, motion, shape, spacing } = useTheme();
  const resolvedAddress = address?.trim() || '-';
  const accentColor = isSelected ? colors.primary : colors.text;

  return (
    <Pressable
      accessibilityLabel={`${typeLabel}, ${resolvedAddress}`}
      accessibilityRole="button"
      accessibilityState={{
        busy: isSelecting,
        disabled: isDisabled,
        selected: isSelected,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isSelected
            ? colors.primarySoft
            : pressed
              ? colors.statePressed
              : 'transparent',
          borderRadius: shape.radius.control,
          gap: spacing.md,
          opacity: isDisabled ? motion.opacity.disabled : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: isSelected ? colors.surfaceElevated : colors.surfaceSunken,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <Ionicons name={iconName} size={19} color={accentColor} />
      </View>

      <View style={styles.textBlock}>
        <Text
          variant="label"
          weight="semiBold"
          style={[
            styles.title,
            {
              color: accentColor,
            },
          ]}
        >
          {typeLabel}
        </Text>
        <Text
          variant="caption"
          weight="regular"
          numberOfLines={2}
          style={[
            styles.subtitle,
            {
              color: isSelected ? colors.primary : colors.mutedText,
            },
          ]}
        >
          {resolvedAddress}
        </Text>
      </View>

      {isSelecting ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : isSelected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  subtitle: {
    flexShrink: 1,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    letterSpacing: 0,
  },
});
