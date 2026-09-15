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
}: StoreRatingProps) {
  const { colors, spacing } = useTheme();
  const hasRating = typeof rating === "number" && Number.isFinite(rating) && rating > 0;
  const hasReviewCount =
    typeof reviewCount === "number" &&
    Number.isFinite(reviewCount) &&
    reviewCount > 0;
  const hasCuisine = Boolean(cuisine?.trim());
  const resolvedCuisine = cuisine ? decodeDisplayText(cuisine) : undefined;
  const shouldRender = hasRating || hasReviewCount || hasCuisine;

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

      {hasRating || hasReviewCount ? (
        <View style={styles.row}>
          {hasRating && (
            <View style={styles.ratingContainer}>
              <Icon
                type="AntDesign"
                name="star"
                size={14}
                color={colors.yellow500}
              />
              <Text
                variant="caption"
                weight="semiBold"
                style={[styles.rating, { color: colors.text }]}
              >
                {rating.toFixed(1)}
              </Text>
            </View>
          )}

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
