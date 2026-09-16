import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import {
  StyleSheet,
  type StyleProp,
  type ImageStyle,
  type ViewStyle,
  View,
} from "react-native";
import { useTheme } from "../../../../general/theme/theme";

type Props = {
  accessibilityLabel: string;
  containerStyle?: StyleProp<ViewStyle>;
  imageUri: string;
  imageStyle?: StyleProp<ImageStyle>;
};

export const getProductInfoHeaderMaxHeight = (width: number) =>
  Math.min(Math.max(width * 0.82, 300), 420);

export default function ImageHeader({
  accessibilityLabel,
  containerStyle,
  imageUri,
  imageStyle,
}: Props) {
  const { colors } = useTheme();
  const [hasImageError, setHasImageError] = useState(false);
  const hasImage = Boolean(imageUri.trim()) && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [imageUri]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.primarySoft },
        containerStyle,
      ]}
    >
      {hasImage ? (
        <Animated.Image
          accessibilityLabel={accessibilityLabel}
          accessible
          onError={() => setHasImageError(true)}
          source={{ uri: imageUri }}
          resizeMode="cover"
          style={[styles.image, imageStyle]}
        />
      ) : (
        <View style={styles.fallback}>
          <View style={[styles.fallbackHalo, { backgroundColor: colors.surfaceElevated }]}>
            <MaterialCommunityIcons color={colors.primary} name="food-outline" size={42} />
          </View>
        </View>
      )}

      <LinearGradient
        colors={[colors.mediaScrimStart, colors.mediaScrimEnd]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: "100%",
  },
  fallback: {
    alignItems: "center",
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  fallbackHalo: {
    alignItems: "center",
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
