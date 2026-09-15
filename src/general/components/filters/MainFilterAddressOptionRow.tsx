import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '../Icon';
import Text from '../Text';
import { useTheme } from '../../theme/theme';

type Props = {
  label: string;
  description?: string;
  iconName?: string;
  iconType?: React.ComponentProps<typeof Icon>['type'];
  isSelected: boolean;
  onPress: () => void;
};

export default function MainFilterAddressOptionRow({
  label,
  description,
  iconName = 'home-outline',
  iconType = 'Ionicons',
  isSelected,
  onPress,
}: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isSelected ? colors.primarySoft : 'transparent',
          borderRadius: shape.radius.control,
          gap: spacing.md,
          opacity: pressed ? 0.8 : 1,
          paddingHorizontal: spacing.md,
        },
      ]}
    >
      <Icon
        type={iconType}
        name={iconName}
        size={22}
        color={isSelected ? colors.primary : colors.textSubtle}
      />

      <View style={styles.content}>
        <Text
          weight="medium"
          variant="label"
          style={styles.label}
        >
          {label}
        </Text>
        {description ? (
          <Text
            color={colors.textSubtle}
            style={styles.description}
            variant="caption"
          >
            {description}
          </Text>
        ) : null}
      </View>

      {isSelected ? (
        <View
          style={[
            styles.check,
            {
              backgroundColor: colors.primary,
              borderRadius: shape.radius.pill,
            },
          ]}
        >
          <Icon type="Feather" name="check" size={15} color={colors.onPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  check: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  label: {
    flexShrink: 1,
  },
});
