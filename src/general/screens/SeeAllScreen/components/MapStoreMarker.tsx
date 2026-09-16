import React from "react";
import { StyleSheet, View } from "react-native";

import Icon from "../../../components/Icon";
import { useTheme } from "../../../theme/theme";

/** A static marker snapshot; selection is shown in the detail sheet. */
export default function MapStoreMarker() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.pin,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      <Icon color={colors.primary} name="silverware-fork-knife" size={18} type="MaterialCommunityIcons" />
      <View style={[styles.pointer, { backgroundColor: colors.surface, borderColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 2,
    elevation: 4,
    height: 44,
    justifyContent: "center",
    marginBottom: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    width: 44,
  },
  pointer: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    bottom: -6,
    height: 12,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    width: 12,
  },
});
