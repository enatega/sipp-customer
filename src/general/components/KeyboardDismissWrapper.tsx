import React from "react";
import { Platform, ScrollView, type ViewStyle } from "react-native";
import useKeyboard from "../hooks/useKeyboard";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
}

export default function KeyboardDismissWrapper({ children, style, scrollEnabled = true }: Props) {
  const { dismissKeyboard } = useKeyboard();

  return (
    <ScrollView 
      style={[{ flex: 1 }, style]}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={dismissKeyboard}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      scrollEnabled={scrollEnabled}
    >
      {children}
    </ScrollView>
  );
}
