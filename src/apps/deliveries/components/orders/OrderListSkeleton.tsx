import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "../../../../general/components/Skeleton";
import { useTheme } from "../../../../general/theme/theme";

const SKELETON_ROWS = 4;

const OrderListSkeleton = () => {
  const { colors, shape, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <Skeleton
        width={180}
        height={28}
        borderRadius={8}
      />
      <View style={styles.list}>
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: shape.radius.hero,
                padding: spacing.lg,
              },
            ]}
          >
            <Skeleton
              width={72}
              height={72}
              borderRadius={shape.radius.surface}
            />
            <View style={styles.info}>
              <Skeleton
                width="58%"
                height={20}
                borderRadius={6}
              />
              <Skeleton
                width="40%"
                height={14}
                borderRadius={6}
              />
              <Skeleton
                width={124}
                height={26}
                borderRadius={shape.radius.pill}
              />
            </View>
            <View style={styles.trailing}>
              <Skeleton
                width={68}
                height={18}
                borderRadius={6}
              />
            </View>
            <View style={styles.fullWidth}>
              <Skeleton width="100%" height={4} borderRadius={shape.radius.pill} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default OrderListSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    paddingTop: 12,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  list: {
    gap: 16,
  },
  row: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  fullWidth: {
    width: "100%",
  },
  trailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
});
