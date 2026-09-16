import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../general/theme/theme';
import CheckoutHeader from './CheckoutHeader';

type Props = {
  onBackPress: () => void;
  onChangeTipValue: (value: string) => void;
  onSavePress: () => void;
  tipValue: string;
};

export default function CheckoutCustomTipScreen({
  onBackPress,
  onChangeTipValue,
  onSavePress,
  tipValue,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('deliveries');
  const { colors, layout, shape, spacing, typography } = useTheme();
  const { gutter } = useWindowClass();
  const [isFocused, setIsFocused] = React.useState(false);
  const currencyLabel = useDeliveriesCurrencyLabel();
  const parsedTip = Number.parseFloat(tipValue);
  const isSaveDisabled = !Number.isFinite(parsedTip) || parsedTip <= 0;
  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top + 62 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.screen, { backgroundColor: colors.canvas }]}
    >
      <CheckoutHeader
        backIconName="close"
        onBackPress={onBackPress}
        title={t('checkout_tip_custom_title')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.lg, paddingHorizontal: gutter },
        ]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentInner, { gap: spacing.lg, maxWidth: layout.contentMaxWidth.readable }]}>
          <Text color={colors.textSubtle} variant="supporting">
            {t('checkout_tip_description')}
          </Text>

          <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: isFocused ? colors.primary : colors.border,
              borderRadius: shape.radius.surface,
              borderWidth: isFocused ? shape.borderWidth.selected : shape.borderWidth.hairline,
              gap: spacing.md,
              paddingHorizontal: spacing.lg,
            },
          ]}
        >
          <Text
            weight="medium"
            style={{
              color: colors.text,
              fontSize: typography.size.md2,
            }}
          >
            {currencyLabel}
          </Text>

          <TextInput
            autoFocus
            keyboardType="decimal-pad"
            onChangeText={onChangeTipValue}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            placeholder={t('checkout_tip_custom_placeholder')}
            placeholderTextColor={colors.mutedText}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: typography.size.md2,
              },
            ]}
            value={tipValue}
          />
          </View>
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
            disabled={isSaveDisabled}
            fullWidth
            label={t('checkout_tip_custom_done')}
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
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  contentInner: {
    marginHorizontal: 'auto',
    width: '100%',
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
    paddingBottom: 0,
    paddingTop: 0,
    textAlignVertical: 'center',
  },
  inputWrapper: {
    alignItems: 'baseline',
    flexDirection: 'row',
    minHeight: 62,
    paddingVertical: 12,
  },
  screen: {
    flex: 1,
  },
});
