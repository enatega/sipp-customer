import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  actionLabel?: string;
  description: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  isActionPending?: boolean;
  onAction?: () => void;
  title: string;
  tone?: 'neutral' | 'danger';
};

export default function SupportStatePanel({
  actionLabel,
  description,
  iconName = 'chatbubbles-outline',
  isActionPending = false,
  onAction,
  title,
  tone = 'neutral',
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const isDanger = tone === 'danger';
  const foregroundColor = isDanger ? colors.dangerText : colors.primary;
  const backgroundColor = isDanger ? colors.dangerSoft : colors.primarySoft;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: shape.radius.hero,
          padding: spacing.xxl,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor,
            borderRadius: shape.radius.surface,
          },
        ]}
      >
        <Ionicons color={foregroundColor} name={iconName} size={26} />
      </View>

      <Text accessibilityRole="header" color={colors.textStrong} variant="cardTitle" weight="bold">
        {title}
      </Text>
      <Text color={colors.textSubtle} style={styles.description} variant="supporting">
        {description}
      </Text>

      {actionLabel && onAction ? (
        <Button
          disabled={isActionPending}
          isLoading={isActionPending}
          label={actionLabel}
          onPress={onAction}
          size="compact"
          style={styles.action}
          variant={isDanger ? 'secondary' : 'primary'}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: 4,
    minWidth: 144,
  },
  container: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
  },
  description: {
    maxWidth: 320,
    textAlign: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    marginBottom: 2,
    width: 52,
  },
});
