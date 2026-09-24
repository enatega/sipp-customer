import React from 'react';
import { useTranslation } from 'react-i18next';
import SupportStatePanel from './SupportStatePanel';
import SupportTicketsSkeleton from './SupportTicketsSkeleton';

type Props = {
  hasTickets: boolean;
  isError: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onNewTicket: () => void;
  onRetry: () => void;
};

export default function SupportTicketsEmptyState({
  hasTickets,
  isError,
  isPending,
  isRefetching,
  onNewTicket,
  onRetry,
}: Props) {
  const { t } = useTranslation('deliveries');

  if (isPending) {
    return <SupportTicketsSkeleton />;
  }

  if (isError) {
    return (
      <SupportStatePanel
        actionLabel={t('support_retry')}
        description={t('support_error_description')}
        iconName="cloud-offline-outline"
        isActionPending={isRefetching}
        onAction={onRetry}
        title={t('support_error_title')}
        tone="danger"
      />
    );
  }

  if (!hasTickets) {
    return (
      <SupportStatePanel
        actionLabel={t('support_new_ticket')}
        description={t('support_tickets_empty_description')}
        iconName="document-text-outline"
        onAction={onNewTicket}
        title={t('support_tickets_empty_title')}
      />
    );
  }

  return (
    <SupportStatePanel
      description={t('support_tickets_no_results_description')}
      iconName="search-outline"
      title={t('support_tickets_no_results_title')}
    />
  );
}
