import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../Button';
import Text from '../Text';
import { useTheme } from '../../theme/theme';

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  variant: 'loading' | 'empty' | 'error';
};

export default function ListStateView({
  title,
  description,
  actionLabel,
  onActionPress,
  containerStyle,
  variant,
}: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.md }, containerStyle]}>
      {variant === 'loading' ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor: variant === 'error' ? colors.dangerSoft : colors.primarySoft,
              borderRadius: shape.radius.surface,
            },
          ]}
        >
          <Ionicons
            name={variant === 'error' ? 'alert-circle-outline' : 'search-outline'}
            size={34}
            color={variant === 'error' ? colors.danger : colors.primary}
          />
        </View>
      )}

      {title ? (
        <Text variant="cardTitle" weight="bold" style={styles.title}>
          {title}
        </Text>
      ) : null}

      {description ? (
        <Text color={colors.textSubtle} variant="supporting" style={styles.description}>
          {description}
        </Text>
      ) : null}

      {actionLabel && onActionPress ? (
        <Button
          label={actionLabel}
          onPress={onActionPress}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    minWidth: 140,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  description: {
    maxWidth: 320,
    textAlign: 'center',
  },
  iconWell: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    textAlign: 'center',
  },
});
