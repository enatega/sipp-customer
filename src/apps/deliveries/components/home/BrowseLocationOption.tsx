import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  label: string;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  kind: 'city' | 'address';
  selected?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function BrowseLocationOption({
  label,
  subtitle,
  iconName,
  kind,
  selected = false,
  loading = false,
  disabled = false,
  onPress,
}: Props) {
  const { colors, motion, shape } = useTheme();
  const isCity = kind === 'city';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${label}, ${subtitle}` : label}
      accessibilityState={{ selected, busy: loading, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, {
        backgroundColor: selected ? colors.primarySoft : pressed ? colors.statePressed : colors.surfaceElevated,
        borderColor: selected ? colors.primary : colors.divider,
        borderRadius: shape.radius.surface,
        opacity: disabled ? motion.opacity.disabled : 1,
      }]}
    >
      <View style={[styles.iconWrap, {
        backgroundColor: selected ? colors.surfaceElevated : isCity ? colors.surfaceSunken : colors.primarySoft,
        borderRadius: isCity ? shape.radius.pill : shape.radius.control,
      }]}>
        <Ionicons name={iconName} size={21} color={isCity && !selected ? colors.iconMuted : colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text variant="cardTitle" weight="semiBold" color={selected ? colors.primary : colors.textStrong} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? <Text variant="caption" color={colors.textSubtle} numberOfLines={2}>
          {subtitle}
        </Text> : null}
      </View>
      {loading ? <ActivityIndicator size="small" color={colors.primary} /> : selected ? (
        <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
      ) : isCity ? (
        <View style={[styles.radio, { borderColor: colors.iconDisabled }]} />
      ) : (
        <Ionicons name="chevron-forward" size={21} color={colors.textSubtle} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  radio: { width: 23, height: 23, borderRadius: 12, borderWidth: 2 },
});
