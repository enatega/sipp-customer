import React, { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme';
import Text from './Text';
import Button from './Button';
import { useReducedMotion } from '../hooks/useReducedMotion';

type PopupAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

type Props = {
  visible: boolean;
  title: string;
  description: string;
  illustration?: ReactNode;
  primaryAction: PopupAction;
  secondaryAction?: PopupAction;
  showPrimaryAction?: boolean;
  onRequestClose?: () => void;
  dismissOnOverlayPress?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function AppPopup({
  visible,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  showPrimaryAction = true,
  onRequestClose,
  dismissOnOverlayPress = false,
  containerStyle,
}: Props) {
  const { colors, elevation, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const showsPrimaryAction = showPrimaryAction;
  const showsActions = showsPrimaryAction || Boolean(secondaryAction);

  const handleOverlayPress = () => {
    if (dismissOnOverlayPress) {
      onRequestClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isReducedMotionEnabled ? 'none' : 'fade'}
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <Pressable
        accessibilityViewIsModal
        style={[
          styles.overlay,
          {
            backgroundColor: colors.scrim,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xxl,
          },
        ]}
        onPress={handleOverlayPress}
      >
        <Pressable onPress={() => undefined} style={styles.cardContainer}>
          <View
            style={[
              styles.card,
              elevation.overlay,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: shape.radius.sheet,
                paddingBottom: spacing.lg,
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.xxl,
              },
              containerStyle,
            ]}
          >
            {illustration ? (
              <View style={[styles.illustration, { marginBottom: spacing.xl }]}>
                {illustration}
              </View>
            ) : null}

            <View style={[styles.content, { gap: spacing.lg }]}>
              <View style={[styles.copy, { gap: spacing.sm }]}>
                <Text variant="sectionTitle" weight="semiBold" accessibilityRole="header" style={styles.title}>
                  {title}
                </Text>
                <Text variant="supporting" style={[styles.description, { color: colors.textSubtle }]}>
                  {description}
                </Text>
              </View>

              {showsActions ? (
                <View style={[styles.actions, { gap: spacing.sm }]}>
                  {showsPrimaryAction ? (
                    <Button
                      label={primaryAction.label}
                      onPress={primaryAction.onPress}
                      variant={primaryAction.variant}
                      isLoading={primaryAction.isLoading}
                      disabled={primaryAction.disabled}
                      fullWidth
                      style={[styles.button, primaryAction.style]}
                    />
                  ) : null}

                  {secondaryAction ? (
                    <Button
                      label={secondaryAction.label}
                      onPress={secondaryAction.onPress}
                      variant={secondaryAction.variant}
                      isLoading={secondaryAction.isLoading}
                      disabled={secondaryAction.disabled}
                      fullWidth
                      style={[styles.button, secondaryAction.style]}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '94%',
    maxWidth: 400,
  },
  illustration: {
    alignItems: 'center',
  },
  content: {},
  copy: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  actions: {},
  button: {
    width: '100%',
  },
});
