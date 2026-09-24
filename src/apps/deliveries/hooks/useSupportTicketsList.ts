import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupportMyTicketsQuery } from './useSupportMyTicketsQuery';
import {
  mapSupportTicketToListItem,
  matchesSupportTicketFilter,
  type SupportTicketFilter,
} from '../utils/supportTicketMappers';

export function useSupportTicketsList() {
  const { t } = useTranslation('deliveries');
  const query = useSupportMyTicketsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SupportTicketFilter>('all');
  const rawTickets = query.data?.tickets;
  const tickets = useMemo(
    () => rawTickets?.map((ticket) =>
      mapSupportTicketToListItem(ticket, (orderId) => t('support_tickets_order_id', { orderId })),
    ) ?? [],
    [rawTickets, t],
  );
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => {
      if (!matchesSupportTicketFilter(ticket, filter)) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      return [
        ticket.title,
        ticket.preview,
        ticket.statusLabel,
        ticket.orderIdLabel,
        ticket.id,
      ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery));
    }),
    [filter, normalizedSearchQuery, tickets],
  );

  return {
    filter,
    hasTickets: tickets.length > 0,
    query,
    searchQuery,
    setFilter,
    setSearchQuery,
    visibleTickets,
  };
}
