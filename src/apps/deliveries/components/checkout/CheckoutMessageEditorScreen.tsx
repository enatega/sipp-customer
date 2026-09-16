import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';
import CheckoutHeader from './CheckoutHeader';
import { CHECKOUT_MESSAGE_MAX_LENGTH } from './checkoutMessageUtils';

type Props = {
  ctaLabel: string;
  description: string;
  onBackPress: () => void;
  onChangeText: (text: string) => void;
  onSavePress: () => void;
  placeholder: string;
  title: string;
  value: string;
};

export default function CheckoutMessageEditorScreen({
  ctaLabel,
  description,
  onBackPress,
  onChangeText,
  onSavePress,
  placeholder,
  title,
  value,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, layout, shape, spacing, typography } = useTheme();
  const { gutter } = useWindowClass();
  const [isFocused, setIsFocused] = React.useState(false);
  const trimmedValue = value.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.canvas }]}
    >
      <CheckoutHeader
        backIconName="close"
        onBackPress={onBackPress}
        title={title}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.lg, paddingHorizontal: gutter },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentInner, { gap: spacing.md, maxWidth: layout.contentMaxWidth.readable }]}>
          <Text color={colors.textSubtle} variant="supporting">
            {description}
          </Text>

          <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: isFocused ? colors.primary : colors.border,
              borderRadius: shape.radius.surface,
              borderWidth: isFocused ? shape.borderWidth.selected : shape.borderWidth.hairline,
              padding: spacing.lg,
            },
          ]}
        >
          <TextInput
            autoFocus
            multiline
            onChangeText={onChangeText}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedText}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: typography.size.md2,
                lineHeight: typography.lineHeight.md,
              },
            ]}
            textAlignVertical="top"
            value={value}
          />
          </View>

          <Text
          color={colors.mutedText}
          style={[
            styles.counter,
            {
              fontSize: typography.size.xs2,
              lineHeight: typography.lineHeight.sm,
            },
          ]}
        >
          {value.length}/{CHECKOUT_MESSAGE_MAX_LENGTH}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.divider,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingHorizontal: gutter,
          },
        ]}
      >
        <View style={[styles.footerInner, { maxWidth: layout.contentMaxWidth.readable }]}>
          <Button
            disabled={trimmedValue.length === 0}
            fullWidth
            label={ctaLabel}
            onPress={onSavePress}
            size="large"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  contentInner: {
    marginHorizontal: 'auto',
    width: '100%',
  },
  counter: {
    textAlign: 'right',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  footerInner: {
    marginHorizontal: 'auto',
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 0,
  },
  inputWrapper: {
    minHeight: 112,
  },
  screen: {
    flex: 1,
  },
});
