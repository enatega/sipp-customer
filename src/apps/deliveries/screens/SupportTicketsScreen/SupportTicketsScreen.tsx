import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SupportHeader from '../../../../general/components/support/SupportHeader';
import SupportTicketListItem from '../../../../general/components/support/SupportTicketListItem';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import SupportStatePanel from '../../components/support/SupportStatePanel';
import SupportTicketsSkeleton from '../../components/support/SupportTicketsSkeleton';
import { useSupportMyTicketsQuery } from '../../hooks/useSupportMyTicketsQuery';
import { SupportHomeNavigationProp } from '../../navigation/supportNavigationTypes';
import { mapSupportTicketToListItem } from '../../utils/supportTicketMappers';

export default function SupportTicketsScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<SupportHomeNavigationProp>();
  const supportMyTicketsQuery = useSupportMyTicketsQuery();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const tickets = useMemo(
    () => supportMyTicketsQuery.data?.tickets.map((ticket) =>
      mapSupportTicketToListItem(ticket, (orderId) => t('support_tickets_order_id', { orderId })),
    ) ?? [],
    [supportMyTicketsQuery.data?.tickets, t],
  );
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleTickets = useMemo(() => {
    if (!normalizedSearchQuery) {
      return tickets;
    }

    return tickets.filter((ticket) => [
      ticket.title,
      ticket.preview,
      ticket.statusLabel,
      ticket.orderIdLabel,
    ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery)));
  }, [normalizedSearchQuery, tickets]);
  const openContactForm = () => navigation.navigate('SupportContactForm', {
    issueLabel: t('support_issue_appointment_support'),
    issueValue: 'appointment_support',
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SupportHeader
        backAccessibilityLabel={t('support_back_action')}
        rightAccessibilityLabel={t('support_tickets_search_action')}
        rightIconName={isSearchOpen ? 'close-outline' : 'search-outline'}
        onRightPress={() => {
          if (isSearchOpen) {
            setSearchQuery('');
          }
          setIsSearchOpen((current) => !current);
        }}
        title={t('support_tickets_title')}
      />

      {isSearchOpen ? (
        <View style={styles.searchContainer}>
          <TextInput
            accessibilityLabel={t('support_tickets_search_action')}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            onChangeText={setSearchQuery}
            placeholder={t('support_tickets_search_placeholder')}
            placeholderTextColor={colors.mutedText}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.backgroundTertiary,
                color: colors.text,
                fontSize: typography.size.md,
              },
            ]}
            value={searchQuery}
          />
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={supportMyTicketsQuery.isRefetching}
            tintColor={colors.primary}
            onRefresh={() => {
              void supportMyTicketsQuery.refetch();
            }}
          />
        )}
      >
        <Text
          color={colors.text}
          weight="bold"
          style={{ fontSize: typography.size.lg, lineHeight: typography.lineHeight.lg2 }}
        >
          {t('support_tickets_heading')}
        </Text>

        {supportMyTicketsQuery.isPending ? (
          <SupportTicketsSkeleton />
        ) : null}

        {supportMyTicketsQuery.isError ? (
          <SupportStatePanel
            actionLabel={t('support_retry')}
            description={t('support_error_description')}
            iconName="cloud-offline-outline"
            isActionPending={supportMyTicketsQuery.isRefetching}
            onAction={() => {
              void supportMyTicketsQuery.refetch();
            }}
            title={t('support_error_title')}
            tone="danger"
          />
        ) : null}

        {!supportMyTicketsQuery.isPending && !supportMyTicketsQuery.isError && tickets.length === 0 ? (
          <SupportStatePanel
            actionLabel={t('support_tickets_empty_action')}
            description={t('support_tickets_empty_description')}
            iconName="document-text-outline"
            onAction={openContactForm}
            title={t('support_tickets_empty_title')}
          />
        ) : null}

        {!supportMyTicketsQuery.isPending
        && !supportMyTicketsQuery.isError
        && tickets.length > 0
        && visibleTickets.length === 0 ? (
          <SupportStatePanel
            description={t('support_tickets_no_results_description')}
            iconName="search-outline"
            title={t('support_tickets_no_results_title')}
          />
        ) : null}

        {visibleTickets.map((ticket) => (
          <SupportTicketListItem
            key={ticket.id}
            dateLabel={ticket.dateLabel}
            dayNumber={ticket.dayNumber}
            onPress={() => navigation.navigate('SupportTicketDetail', { ticket })}
            orderIdLabel={ticket.orderIdLabel}
            preview={ticket.preview}
            statusLabel={ticket.statusLabel}
            statusTone={ticket.statusTone}
            title={ticket.title}
            unreadCount={ticket.unreadCount}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  searchContainer: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
