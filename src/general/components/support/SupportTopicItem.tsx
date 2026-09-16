import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../Text';
import { useTheme } from '../../theme/theme';

type Props = {
  description?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

export default function SupportTopicItem({ description, iconName, label, onPress }: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: colors.primarySoft, borderRadius: shape.radius.control },
          ]}
        >
          <Ionicons color={colors.primary} name={iconName} size={22} />
        </View>
        <View style={[styles.textWrap, { gap: spacing.xs }]}> 
          <Text color={colors.textStrong} variant="body" weight="semiBold">
            {label}
          </Text>
          {description ? (
            <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      <Ionicons
        color={colors.iconMuted}
        name="chevron-forward"
        size={24}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 8,
  },
  iconWrap: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  leftContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
});
