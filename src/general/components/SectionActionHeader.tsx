import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Text from './Text';
import { useTheme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';

type Props = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  density?: 'default' | 'compact';
};

export default function SectionActionHeader({
  title,
  actionLabel,
  onActionPress,
  style,
  density = 'default',
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const isCompact = density === 'compact';

  return (
    <View style={[styles.container, style]}>
      <Text
        accessibilityRole="header"
        variant={isCompact ? 'cardTitle' : 'sectionTitle'}
        weight={isCompact ? 'bold' : 'extraBold'}
        numberOfLines={2}
        style={styles.title}
      >
        {title}
      </Text>

      {actionLabel ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityState={{ disabled: !onActionPress }}
          disabled={!onActionPress}
          onPress={onActionPress}
          pressedScale={0.97}
          style={[
            styles.actionButton,
            {
              borderRadius: shape.radius.control,
              gap: spacing.xs,
              minHeight: isCompact ? 36 : layout.touchTarget.minimum,
              paddingLeft: isCompact ? spacing.xs : spacing.sm,
            },
          ]}
        >
          <Text
            variant={isCompact ? 'caption' : 'label'}
            weight="semiBold"
            color={colors.primary}
          >
            {actionLabel}
          </Text>
          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor: isCompact ? 'transparent' : colors.primarySoft,
                borderRadius: shape.radius.pill,
                height: isCompact ? 18 : 24,
                width: isCompact ? 18 : 24,
              },
            ]}
          >
            <Ionicons color={colors.primary} name="chevron-forward" size={14} />
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
});
