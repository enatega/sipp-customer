import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  title: string;
  subtitle?: string | null;
  subtitleRightAccessory?: React.ReactNode;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  rightAccessory?: React.ReactNode;
  showDivider?: boolean;
};

export default function CheckoutInfoRow({
  title,
  subtitle,
  subtitleRightAccessory,
  iconName,
  onPress,
  rightAccessory,
  showDivider = false,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const containerStyle = [
    styles.container,
    {
      borderBottomColor: colors.divider,
      borderBottomWidth: showDivider ? StyleSheet.hairlineWidth : 0,
      borderRadius: shape.radius.control,
      gap: spacing.md,
      minHeight: layout.touchTarget.comfortable,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  ];
  const content = (
    <>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.primarySoft,
            borderRadius: shape.radius.control,
          },
        ]}
      >
        <Ionicons color={colors.primary} name={iconName} size={20} />
      </View>

      <View style={[styles.textWrap, { gap: spacing.xs }]}>
        <Text numberOfLines={1} variant="label" weight="semiBold">
          {title}
        </Text>

        {subtitle ? (
          <View style={[styles.subtitleRow, { gap: spacing.sm }]}>
            <Text
              color={colors.textSubtle}
              numberOfLines={2}
              style={styles.subtitle}
              variant="caption"
            >
              {subtitle}
            </Text>
            {subtitleRightAccessory ?? null}
          </View>
        ) : null}
      </View>

      {rightAccessory ?? (onPress ? (
        <Ionicons color={colors.iconMuted} name="chevron-forward" size={20} />
      ) : null)}
    </>
  );

  if (!onPress) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={containerStyle}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconWrap: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  subtitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  subtitle: {
    flexShrink: 1,
  },
});
