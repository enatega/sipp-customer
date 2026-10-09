import React, { useEffect, useState } from 'react';
import { Image, type ImageSourcePropType, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
  decorativeImage?: ImageSourcePropType;
  heightFraction?: number;
};

export default function WalletSheet({ visible, title, description, closeLabel, onClose, children, decorativeImage, heightFraction = 0.79 }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const show = Keyboard.addListener('keyboardWillShow', (event) => setKeyboardHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const sheetHeight = Math.min(height * heightFraction, Math.max(300, height - insets.top - keyboardHeight - 24));

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.walletSheetBackdrop }]} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel} />
        <View style={[styles.sheet, { backgroundColor: colors.walletSurface, height: sheetHeight, paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
          {decorativeImage ? (
            <Image
              source={decorativeImage}
              resizeMode="contain"
              style={styles.decorative}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
          <View style={[styles.handle, { backgroundColor: colors.walletTextMuted }]} />
          <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} style={[styles.close, { backgroundColor: colors.walletSurfaceAlt }]}>
            <Ionicons name="close" size={21} color={colors.text} />
          </Pressable>
          <Text color={colors.text} weight="bold" style={styles.title}>{title}</Text>
          {description ? <Text color={colors.walletTextMuted} style={styles.description}>{description}</Text> : null}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 20, paddingTop: 54 },
  decorative: { pointerEvents: 'none', height: 165, position: 'absolute', right: 40, top: -100, width: 178, zIndex: 2 },
  handle: { alignSelf: 'center', borderRadius: 3, height: 5, opacity: 0.55, position: 'absolute', top: 12, width: 36 },
  close: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', position: 'absolute', right: 16, top: 30, width: 44, zIndex: 3 },
  title: { fontSize: 22, lineHeight: 28, marginRight: 48 },
  description: { fontSize: 14, lineHeight: 20, marginTop: 4, marginRight: 34 },
  content: { flexGrow: 1, paddingBottom: 8, paddingTop: 20 },
});
