import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text';
import PressableScale from '../PressableScale';
import { useTheme } from '../../theme/theme';

type Props = {
  icon: React.ReactNode;
  iconSurfaceColor?: string;
  label: string;
  onPress?: () => void;
  subtitle?: string;
  tone?: 'default' | 'danger';
  trailingLabel?: string;
};

export default function ProfileMenuItem({
  icon,
  iconSurfaceColor,
  label,
  onPress,
  subtitle,
  tone = 'default',
  trailingLabel,
}: Props) {
  const { colors } = useTheme();
  const foregroundColor = tone === 'danger' ? colors.danger : colors.text;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.container}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWell,
            { backgroundColor: iconSurfaceColor ?? colors.surfaceSunken },
          ]}
        >
          {icon}
        </View>
        <View style={styles.copy}>
          <Text weight="bold" style={[styles.label, { color: foregroundColor }]}>
            {label}
          </Text>
          {subtitle ? (
            <Text color={colors.mutedText} numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        {trailingLabel ? (
          <Text color={colors.mutedText} numberOfLines={1} style={styles.trailingLabel}>
            {trailingLabel}
          </Text>
        ) : null}
        {onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 68,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    maxWidth: '38%',
  },
  trailingLabel: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
