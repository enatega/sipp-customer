import React from "react";
import { View } from "react-native";
import Text from "../../../../../general/components/Text";
import { useTheme } from "../../../../../general/theme/theme";
import { styles } from "../styles";

interface StoreInfoProps {
  name: string;
  trailingLabel?: string;
}

export default function StoreInfo({ name, trailingLabel }: StoreInfoProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.nameContainer}>
      <Text
        variant="cardTitle"
        weight="semiBold"
        style={[styles.name, { color: colors.text }]}
        numberOfLines={1}
      >
        {name}
      </Text>

      {trailingLabel ? (
        <Text
          weight="medium"
          color={colors.textSubtle}
          variant="caption"
          numberOfLines={1}
          style={styles.location}
        >
          {trailingLabel}
        </Text>
      ) : null}
    </View>
  );
}
