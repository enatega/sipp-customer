import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import Text from '../../../../general/components/Text';
import RatingStars from './RatingStars';

type Props = {
  rating: number;
  description: string;
  storeName: string;
};

export default function SubmittedRatingView({ rating, description, storeName }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.mutedText} style={styles.center}>
        {storeName}
      </Text>
      <RatingStars value={rating} onChange={() => {}} isDisabled />
      <Text variant="title" weight="bold" style={styles.center}>
        {t('rate_order_submitted_heading')}
      </Text>
      <Text variant="body" color={colors.mutedText} style={styles.center}>
        {t('rate_order_submitted_subheading')}
      </Text>
      <View style={[styles.commentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text variant="body" color={description ? colors.text : colors.mutedText}>
          {description || t('rate_order_submitted_no_comment')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  commentBox: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    minHeight: 80,
    padding: 12,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    gap: 10,
  },
});
