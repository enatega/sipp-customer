import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import { useTheme } from '../../../../general/theme/theme';
import useAndroidKeyboardVisible from '../../../../general/hooks/useAndroidKeyboardVisible';
import OffersPanel from '../../components/offers/OffersPanel';

export default function CouponsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const keyboardVisible = useAndroidKeyboardVisible();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.surface, paddingBottom: insets.bottom }} behavior={Platform.OS === 'ios' ? 'padding' : keyboardVisible ? 'height' : undefined}>
      <ScreenHeader title={t('offers_title')} />
      <OffersPanel />
    </KeyboardAvoidingView>
  );
}
