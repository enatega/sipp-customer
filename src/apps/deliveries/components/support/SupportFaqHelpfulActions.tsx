import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  onPressHelpful?: (isHelpful: boolean) => void;
};

export default function SupportFaqHelpfulActions({ onPressHelpful }: Props) {
  const { colors, shape, spacing, typography } = useTheme();
  const { t } = useTranslation('deliveries');
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleFeedback = (isHelpful: boolean) => {
    setFeedback(isHelpful);
    onPressHelpful?.(isHelpful);
  };

  if (feedback !== null) {
    return (
      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.thankYou,
          {
            backgroundColor: colors.successSoft,
            borderRadius: shape.radius.surface,
            padding: spacing.lg,
          },
        ]}
      >
        <Text color={colors.successText} weight="semiBold">
          {t('support_faq_feedback_thanks')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <Text
        color={colors.mutedText}
        weight="medium"
        style={{ fontSize: typography.size.sm2, lineHeight: typography.lineHeight.md }}
      >
        {t('support_faq_feedback_prompt')}
      </Text>

      <View style={styles.actions}>
        <Button
          label={t('support_faq_feedback_yes')}
          variant="secondary"
          onPress={() => handleFeedback(true)}
          style={styles.button}
        />
        <Button
          label={t('support_faq_feedback_no')}
          variant="secondary"
          onPress={() => handleFeedback(false)}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    minHeight: 32,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
  },
  thankYou: {
    alignItems: 'center',
    marginTop: 20,
  },
});
