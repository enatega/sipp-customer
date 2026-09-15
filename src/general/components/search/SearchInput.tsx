import React, { forwardRef, useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/theme";
import Icon from "../Icon";
import { SearchInputProps } from "./types";
import IconButton from "../IconButton";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useWindowClass } from "../../hooks/useWindowClass";
import { useTranslation } from "react-i18next";


const SearchInput = forwardRef<TextInput, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChangeText,
      placeholder,
      onClear,
      onFocus,
      onBlur,
      onSubmitEditing,
      autoFocus = false,
      density = "regular",
      editable = true,
      surfaceElevation = "raised",
      style,
    },
    ref,
  ) {
    const { colors, elevation, layout, motion, shape, spacing, typography } = useTheme();
    const { t } = useTranslation("general");
    const { isCompact } = useWindowClass();
    const isReducedMotionEnabled = useReducedMotion();
    const [isFocused, setIsFocused] = useState(false);
    const focusProgress = useRef(new Animated.Value(0)).current;
    const metrics = useMemo(
      () => {
        if (density === "compact") {
          return {
            horizontalPadding: spacing.md,
            iconSize: 20,
            minHeight: layout.touchTarget.comfortable,
          };
        }

        return {
          horizontalPadding: isCompact ? spacing.md : spacing.lg,
          iconSize: isCompact ? 21 : 23,
          minHeight: isCompact ? 56 : 60,
        };
      },
      [density, isCompact, layout.touchTarget.comfortable, spacing.lg, spacing.md],
    );

    const animateFocus = (toValue: number) => {
      if (isReducedMotionEnabled) {
        focusProgress.setValue(toValue);
        return;
      }

      Animated.timing(focusProgress, {
        duration: motion.duration.quick,
        toValue,
        useNativeDriver: true,
      }).start();
    };

    const handleClear = () => {
      onChangeText("");
      onClear?.();
    };

    const handleFocus: TextInputProps["onFocus"] = (event) => {
      setIsFocused(true);
      animateFocus(1);
      onFocus?.(event);
    };

    const handleBlur: TextInputProps["onBlur"] = (event) => {
      setIsFocused(false);
      animateFocus(0);
      onBlur?.(event);
    };

    return (
      <View
        style={[
          styles.focusRingContainer,
          {
            borderRadius: shape.radius.surface + 3,
            maxWidth: layout.contentMaxWidth.readable,
            width: "100%",
          },
          style,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.focusHalo,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.surface + 3,
              opacity: focusProgress,
              transform: [
                {
                  scaleX: focusProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.container,
            isFocused
              ? surfaceElevation === "raised" ? elevation.floating : elevation.raised
              : elevation[surfaceElevation],
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: shape.radius.surface,
              gap: spacing.sm,
              height: metrics.minHeight,
              paddingHorizontal: metrics.horizontalPadding,
              transform: [
                {
                  translateY: focusProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -motion.distance.press],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.searchIconContainer,
              {
                backgroundColor: isFocused ? colors.primarySoft : "transparent",
                borderRadius: shape.radius.pill,
              },
            ]}
          >
            <Ionicons
              name="search"
              color={isFocused ? colors.primary : colors.iconMuted}
              size={metrics.iconSize}
            />
          </View>

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: typography.role.body.fontSize,
                fontFamily: typography.fontFamily.regular,
                textAlignVertical: "center",
              },
            ]}
            placeholder={placeholder ?? t("generic_list_search_placeholder")}
            placeholderTextColor={colors.textSubtle}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmitEditing}
            autoFocus={autoFocus}
            editable={editable}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never"
          />

          {value.length > 0 ? (
            <IconButton
              accessibilityLabel={t("search_clear_label")}
              icon={(
                <Icon
                  type="Entypo"
                  name="cross"
                  size={18}
                  color={colors.textSubtle}
                />
              )}
              onPress={handleClear}
              variant="soft"
            />
          ) : null}
        </Animated.View>
      </View>
    );
  },
);

export default SearchInput;

const styles = StyleSheet.create({
  focusRingContainer: {
    padding: 3,
    position: "relative",
  },
  focusHalo: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  searchIconContainer: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    width: 40,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
  },
});
