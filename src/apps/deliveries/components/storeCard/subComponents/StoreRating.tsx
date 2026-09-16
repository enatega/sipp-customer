import React from "react";
import { View } from "react-native";
import Icon from "../../../../../general/components/Icon";
import Text from "../../../../../general/components/Text";
import { useTheme } from "../../../../../general/theme/theme";
import { styles } from "../styles";

interface StoreRatingProps {
  rating?: number;
  reviewCount?: number;
  cuisine?: string;
  fallbackLabel?: string;
}

function decodeDisplayText(value: string) {
  let decodedValue = value;

  if (decodedValue.includes('%')) {
    try {
      decodedValue = decodeURIComponent(decodedValue);
    } catch {
      decodedValue = value;
    }
  }

  return decodedValue.replaceAll('&amp;', '&');
}

export default function StoreRating({
  rating,
  reviewCount,
  cuisine,
  fallbackLabel,
}: StoreRatingProps) {
  const { colors, spacing } = useTheme();
  const hasRating = typeof rating === "number" && Number.isFinite(rating) && rating > 0;
  const hasReviewCount =
    typeof reviewCount === "number" &&
    Number.isFinite(reviewCount) &&
    reviewCount > 0;
  const hasCuisine = Boolean(cuisine?.trim());
  const resolvedCuisine = cuisine ? decodeDisplayText(cuisine) : undefined;
  const shouldShowFallback =
    !hasRating && !hasReviewCount && Boolean(fallbackLabel);
  const shouldRender =
    hasRating || hasReviewCount || hasCuisine || shouldShowFallback;

  if (!shouldRender) {
    return null;
  }

  return (
    <View
      style={[styles.row, { gap: spacing.sm }]}
    >
      {hasCuisine ? (
        <Text
          color={colors.textSubtle}
          numberOfLines={1}
          style={styles.cuisine}
          variant="caption"
          weight="medium"
        >
          {resolvedCuisine}
        </Text>
      ) : null}

      {hasRating || hasReviewCount || shouldShowFallback ? (
        <View style={styles.row}>
          {hasRating || shouldShowFallback ? (
            <View style={styles.ratingContainer}>
              <Icon
                type="AntDesign"
                name="star"
                size={14}
                color={shouldShowFallback ? colors.warning : colors.yellow500}
              />
              <Text
                variant="caption"
                weight="semiBold"
                style={[
                  styles.rating,
                  {
                    color: shouldShowFallback
                      ? colors.warningText
                      : colors.text,
                  },
                ]}
              >
                {hasRating ? rating.toFixed(1) : fallbackLabel}
              </Text>
            </View>
          ) : null}

          {hasReviewCount && (
            <Text
              variant="caption"
              weight="regular"
              style={[
                styles.reviewCount,
                {
                  color: colors.textSubtle,
                },
              ]}
            >
              ({reviewCount.toLocaleString()}+)
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
