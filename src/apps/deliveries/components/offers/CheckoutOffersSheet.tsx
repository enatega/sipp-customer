import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import BottomSheetHandle from '../../../../general/components/BottomSheetHandle';
import SwipeableBottomSheet from '../../../../general/components/SwipeableBottomSheet';
import useAndroidKeyboardVisible from '../../../../general/hooks/useAndroidKeyboardVisible';
import { useTheme } from '../../../../general/theme/theme';
import OffersPanel from './OffersPanel';

type Props = React.ComponentProps<typeof OffersPanel> & { onClose: () => void };

export default function CheckoutOffersSheet({ onClose, ...panelProps }: Props) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, spacing, shape, layout } = useTheme();
  const { t } = useTranslation('deliveries');
  const keyboardVisible = useAndroidKeyboardVisible();
  const [availableHeight, setAvailableHeight] = useState(height);
  const sheetHeight = Math.max(0, availableHeight - insets.top) * 0.94;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : keyboardVisible ? 'height' : undefined}>
        <View style={styles.fill} onLayout={event => setAvailableHeight(event.nativeEvent.layout.height)}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('offers_close')} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlayDark20 }]} />
          <SwipeableBottomSheet expandedHeight={sheetHeight} collapsedHeight={0} initialState="expanded" modal onCollapsed={onClose}
            horizontalInset={Math.max(0, (width - layout.contentMaxWidth.readable) / 2)}
            handle={<BottomSheetHandle />}
            style={{ backgroundColor: colors.surface, borderTopLeftRadius: shape.radius.surface, borderTopRightRadius: shape.radius.surface, paddingTop: spacing.md, paddingBottom: insets.bottom }}>
            <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
              <Text accessibilityRole="header" variant="sectionTitle" weight="bold">{t('offers_title')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t('offers_close')} onPress={onClose} style={{ minWidth: layout.touchTarget.minimum, minHeight: layout.touchTarget.minimum, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <OffersPanel {...panelProps} />
          </SwipeableBottomSheet>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({ fill: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } });
