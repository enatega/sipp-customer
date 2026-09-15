import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

export type BottomSheetHandleVariant = 'visible' | 'hidden';

type Props = {
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  variant?: BottomSheetHandleVariant;
};

export default function BottomSheetHandle({
  color,
  containerStyle,
  variant = 'visible',
}: Props) {
  const { colors, shape, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: spacing.md, paddingTop: spacing.xs },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.handle,
          {
            backgroundColor: color ?? colors.iconDisabled,
            borderRadius: shape.radius.pill,
            opacity: variant === 'hidden' ? 0 : 1,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  handle: {
    height: 4,
    width: 36,
  },
});
