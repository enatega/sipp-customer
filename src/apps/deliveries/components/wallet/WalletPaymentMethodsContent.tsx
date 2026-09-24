import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import type { WalletSavedCard } from '../../../../general/api/walletSavedCardsService';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import SavedCardRow from './SavedCardRow';
import AddCardRow from './AddCardRow';

type Props = {
  cards: WalletSavedCard[];
  isLoading: boolean;
  isError: boolean;
  isSelecting: boolean;
  onSelect: (cardId: string) => void;
  onAddCard: () => void;
  onRetry: () => void;
  onDone: () => void;
};

export default function WalletPaymentMethodsContent({ cards, isLoading, isError, isSelecting, onSelect, onAddCard, onRetry, onDone }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const selectedCardId = cards.find((card) => card.isDefault)?.id ?? cards[0]?.id;

  return (
    <View style={styles.content}>
      {isLoading ? <ActivityIndicator color={colors.walletBlue} style={styles.loading} /> : null}
      {isError ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.error}>
          <Ionicons name="refresh-outline" size={18} color={colors.dangerText} />
          <Text color={colors.dangerText}>{t('wallet_cards_error')}</Text>
        </Pressable>
      ) : null}
      {!isLoading && !isError && cards.length === 0 ? <Text color={colors.walletTextMuted} style={styles.empty}>{t('wallet_no_saved_cards')}</Text> : null}
      {cards.map((card) => (
        <SavedCardRow
          key={card.id}
          brand={card.brand}
          holderName={card.name?.trim() || card.brand.toUpperCase()}
          subtitle={`•••• ${card.last4}`}
          secondarySubtitle={`${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`}
          isDefault={card.id === selectedCardId}
          onPress={card.id === selectedCardId || isSelecting ? undefined : () => onSelect(card.id)}
        />
      ))}
      <AddCardRow label={t('wallet_add_card')} onPress={onAddCard} />
      <View style={styles.secureNote}>
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.walletTextMuted} />
        <Text color={colors.walletTextMuted} style={styles.secureCopy}>{t('wallet_cards_secure_note')}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSelecting }} disabled={isSelecting} onPress={onDone} style={styles.done}>
        <LinearGradient colors={[colors.walletCtaStart, colors.walletCtaEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.doneGradient}>
          <Text color={colors.white} weight="semiBold" style={styles.doneText}>{t('wallet_done')}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  loading: { marginVertical: 20 },
  error: { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 52 },
  empty: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  secureNote: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 18 },
  secureCopy: { flex: 1, fontSize: 12, lineHeight: 17 },
  done: { marginTop: 'auto', paddingTop: 22 },
  doneGradient: { alignItems: 'center', borderRadius: 18, height: 56, justifyContent: 'center' },
  doneText: { fontSize: 16, lineHeight: 20 },
});
