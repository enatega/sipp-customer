import React, { useCallback } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import SupportHeader from '../../../../general/components/support/SupportHeader';
import SupportTicketListItem from '../../../../general/components/support/SupportTicketListItem';
import SupportTopicItem from '../../../../general/components/support/SupportTopicItem';
import Text from '../../../../general/components/Text';
import { showToast } from '../../../../general/components/AppToast';
import { useTheme } from '../../../../general/theme/theme';
import {
  DELIVERIES_SUPPORT_PHONE_NUMBER,
  SUPPORT_NEW_TICKET_DEFAULT_ISSUE,
} from '../../constants/support';
import SupportActiveOrderCard from '../../components/support/SupportActiveOrderCard';
import SupportTicketsEmptyState from '../../components/support/SupportTicketsEmptyState';
import SupportTicketsToolbar from '../../components/support/SupportTicketsToolbar';
import { getOrderStatusPresentation } from '../../components/orders/orderPresentation';
import { useActiveOrders } from '../../hooks/useOrders';
import { useSupportTicketsList } from '../../hooks/useSupportTicketsList';
import type { DeliveriesStackParamList } from '../../navigation/types';
import type { SupportTicketListItemModel } from '../../utils/supportTicketMappers';

export default function SupportScreen() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<NativeStackNavigationProp<DeliveriesStackParamList>>();
  const activeOrdersQuery = useActiveOrders({ limit: 1 });
  const {
    filter,
    hasTickets,
    query,
    searchQuery,
    setFilter,
    setSearchQuery,
    visibleTickets,
  } = useSupportTicketsList();
  const activeOrder = activeOrdersQuery.data?.pages[0]?.items[0];
  const activeOrderStatus = activeOrder
    ? getOrderStatusPresentation(activeOrder.orderStatus, t)
    : undefined;

  const handleCallSupport = useCallback(async () => {
    try {
      await Linking.openURL(`tel:${DELIVERIES_SUPPORT_PHONE_NUMBER}`);
    } catch {
      showToast.error(t('support_call_action'));
    }
  }, [t]);

  const handleNewTicket = useCallback(() => {
    navigation.navigate('SupportContactForm', {
      issueLabel: t('support_issue_appointment_support'),
      issueValue: SUPPORT_NEW_TICKET_DEFAULT_ISSUE,
    });
  }, [navigation, t]);

  const handleTicketPress = useCallback((ticket: SupportTicketListItemModel) => {
    navigation.navigate('SupportTicketDetail', { ticket });
  }, [navigation]);

  const renderTicket = useCallback(({ item }: { item: SupportTicketListItemModel }) => (
    <SupportTicketListItem
      dateLabel={item.dateLabel}
      dayNumber={item.dayNumber}
      onPress={() => handleTicketPress(item)}
      orderIdLabel={item.orderIdLabel}
      preview={item.preview}
      statusLabel={item.statusLabel}
      statusTone={item.statusTone}
      title={item.title}
      unreadCount={item.unreadCount}
    />
  ), [handleTicketPress]);

  const listHeader = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text color={colors.text} variant="title" weight="extraBold">
            {t('support_tickets_title')}
          </Text>
          <Text color={colors.textSubtle} variant="supporting">
            {t('support_tickets_subtitle')}
          </Text>
        </View>
        <Button
          icon={<Ionicons color={colors.onPrimary} name="add" size={20} />}
          label={t('support_new_ticket')}
          onPress={handleNewTicket}
          size="compact"
        />
      </View>

      {activeOrder && activeOrderStatus ? (
        <SupportActiveOrderCard
          accessibilityLabel={t('support_active_order_accessibility', {
            status: activeOrderStatus.label,
            store: activeOrder.storeName,
          })}
          actionLabel={t('support_active_order_track')}
          eyebrow={t('support_active_order_eyebrow')}
          imageUri={activeOrder.storeImage ?? activeOrder.storeLogo ?? undefined}
          onPress={() => navigation.navigate('OrderTrackingScreen', { orderId: activeOrder.orderId })}
          statusLabel={activeOrderStatus.label}
          statusTone={activeOrderStatus.tone}
          storeName={activeOrder.storeName}
        />
      ) : null}

      <SupportTopicItem
        description={t('support_topic_faq_description')}
        iconName="help-circle-outline"
        label={t('support_topic_faq')}
        onPress={() => navigation.navigate('SupportFaq')}
      />

      <SupportTicketsToolbar
        filter={filter}
        onFilterChange={setFilter}
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
      />
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SupportHeader
        backAccessibilityLabel={t('support_back_action')}
        onRightPress={() => {
          void handleCallSupport();
        }}
        rightAccessibilityLabel={t('support_call_action')}
        title={t('support_title')}
      />

      <FlatList
        contentContainerStyle={[styles.content, { gap: spacing.md }]}
        data={query.isPending || query.isError ? [] : visibleTickets}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        ListEmptyComponent={(
          <SupportTicketsEmptyState
            hasTickets={hasTickets}
            isError={query.isError}
            isPending={query.isPending}
            isRefetching={query.isRefetching}
            onNewTicket={handleNewTicket}
            onRetry={() => {
              void query.refetch();
            }}
          />
        )}
        ListHeaderComponent={listHeader}
        refreshControl={(
          <RefreshControl
            onRefresh={() => {
              void query.refetch();
            }}
            refreshing={query.isRefetching}
            tintColor={colors.primary}
          />
        )}
        renderItem={renderTicket}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
