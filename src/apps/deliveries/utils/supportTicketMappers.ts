import type { SupportTicketListItemResponse } from '../api/supportTicketService';

export type SupportTicketStatusTone = 'success' | 'info' | 'danger';

export type SupportTicketFilter = 'all' | 'active' | 'closed';

const ACTIVE_STATUS_KEYS = ['opened', 'open', 'in_progress'];
const CLOSED_STATUS_KEYS = ['resolved', 'closed'];

export type SupportTicketListItemModel = {
  assignedAdminId?: string;
  chatBoxId?: string;
  dayNumber: string;
  dateLabel: string;
  id: string;
  orderIdLabel?: string;
  preview: string;
  statusKey: string;
  statusLabel: string;
  statusTone: SupportTicketStatusTone;
  title: string;
  unreadCount?: number;
};

function toReadableText(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusTone(statusKey: string): SupportTicketStatusTone {
  const normalizedStatusKey = statusKey.trim().toLowerCase();

  if (normalizedStatusKey === 'opened' || normalizedStatusKey === 'open') {
    return 'success';
  }

  if (normalizedStatusKey === 'closed') {
    return 'info';
  }

  return 'danger';
}

export function mapSupportTicketToListItem(
  ticket: SupportTicketListItemResponse,
  orderIdTemplate: (orderId: string) => string,
): SupportTicketListItemModel {
  return {
    assignedAdminId: ticket.assignedAdminId ?? undefined,
    chatBoxId: ticket.chatBoxId,
    id: ticket.id,
    title: toReadableText(ticket.title),
    preview: ticket.subtitle,
    dayNumber: ticket.date.day,
    dateLabel: ticket.date.month.trim().toUpperCase(),
    orderIdLabel: ticket.orderId ? orderIdTemplate(ticket.orderId) : undefined,
    statusKey: ticket.status.key.trim().toLowerCase(),
    statusLabel: ticket.status.label,
    statusTone: getStatusTone(ticket.status.key),
    unreadCount: ticket.unreadCount > 0 ? ticket.unreadCount : undefined,
  };
}

export function matchesSupportTicketFilter(
  ticket: Pick<SupportTicketListItemModel, 'statusKey'>,
  filter: SupportTicketFilter,
) {
  if (filter === 'active') {
    return ACTIVE_STATUS_KEYS.includes(ticket.statusKey);
  }

  if (filter === 'closed') {
    return CLOSED_STATUS_KEYS.includes(ticket.statusKey);
  }

  return true;
}
