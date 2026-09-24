import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';
import type { ProfileAppPrefix } from './profileService';

export type WalletSavedCard = {
  id: string;
  name?: string | null;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type WalletSavedCardsResponse = {
  stripeCustomerId: string;
  cards: WalletSavedCard[];
};

export type WalletSetupIntentResponse = {
  setupIntentId: string;
  clientSecret: string;
  stripeCustomerId: string;
};

export type WalletSetDefaultCardResponse = {
  message: string;
};

export type WalletTransactionReason =
  | 'card_topup' | 'order_payment' | 'order_refund' | 'loyalty_conversion'
  | 'opening_balance' | 'credit' | 'debit' | 'withdrawal' | 'unknown';
export type WalletTransactionDirection = 'credit' | 'debit' | 'unknown';
export type WalletStatementFilter = 'all' | 'credit' | 'debit';

export type WalletTransaction = {
  id: string;
  reasonCode: WalletTransactionReason;
  direction: WalletTransactionDirection;
  title: string;
  subtitle: string;
  time: string;
  amount?: number;
  status?: string;
  referenceId?: string;
  orderId?: string;
};

export type WalletTransactionsResponse = {
  data: WalletTransaction[];
  total?: number;
  offset?: number;
  limit?: number;
  isEnd?: boolean;
};

type WalletTransactionApiItem = {
  id?: string;
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  message?: string;
  amount?: number | string;
  status?: string;
  direction?: string;
  reasonCode?: string;
  referenceId?: string;
  orderId?: string;
  createdAt?: string;
  created_at?: string;
};

function normalizeWalletTransactionReason(item: WalletTransactionApiItem): WalletTransactionReason {
  const reason = item.reasonCode?.toLowerCase();
  if (reason === 'card_topup' || reason === 'order_payment' || reason === 'order_refund'
    || reason === 'loyalty_conversion' || reason === 'opening_balance' || reason === 'credit'
    || reason === 'debit' || reason === 'withdrawal') return reason;
  const type = item.type?.toLowerCase();
  if (type === 'refund') return 'order_refund';
  if (type === 'loyalty') return 'loyalty_conversion';
  if (type === 'migrationopeningbalance' || type === 'migration_opening') return 'opening_balance';
  if (type === 'withdrawal' || type === 'debit') return 'debit';
  if (type === 'deposit' || type === 'topup') return 'credit';
  return 'unknown';
}

function mapWalletTransaction(item: WalletTransactionApiItem, index: number): WalletTransaction {
  const parsedAmount = typeof item.amount === 'number'
    ? item.amount
    : typeof item.amount === 'string' && item.amount.trim().length > 0
      ? Number(item.amount)
      : undefined;

  const reasonCode = normalizeWalletTransactionReason(item);
  const direction = item.direction === 'credit' || item.direction === 'debit'
    ? item.direction
    : ['card_topup', 'order_refund', 'loyalty_conversion', 'opening_balance', 'credit'].includes(reasonCode)
      ? 'credit'
      : ['order_payment', 'debit', 'withdrawal'].includes(reasonCode)
        ? 'debit'
        : 'unknown';

  return {
    id: item.id ?? `wallet_txn_${index}`,
    reasonCode,
    direction,
    title: item.title ?? item.message ?? '',
    subtitle: item.subtitle ?? item.description ?? '',
    time: item.createdAt ?? item.created_at ?? '',
    amount: Number.isFinite(parsedAmount) ? parsedAmount : undefined,
    status: item.status,
    referenceId: item.referenceId ?? item.id,
    orderId: item.orderId,
  };
}

function getWalletSavedCardsBase(appPrefix: ProfileAppPrefix) {
  return `/api/v1/apps/${appPrefix}/wallet/saved-cards`;
}

export const walletSavedCardsService = {
  listSavedCards: (appPrefix: ProfileAppPrefix) =>
    apiClient.get<WalletSavedCardsResponse>(getWalletSavedCardsBase(appPrefix)),

  createSetupIntent: (appPrefix: ProfileAppPrefix) =>
    apiClient.post<WalletSetupIntentResponse>(
      `${getWalletSavedCardsBase(appPrefix)}/setup-intent`,
      {},
    ),

  setDefaultSavedCard: (appPrefix: ProfileAppPrefix, paymentMethodId: string) =>
    apiClient.patch<WalletSetDefaultCardResponse>(
      `${getWalletSavedCardsBase(appPrefix)}/${paymentMethodId}/default`,
      {},
    ),

  listTransactions: (
    appPrefix: ProfileAppPrefix,
    input: { offset?: number; limit?: number; filter?: WalletStatementFilter; statement?: boolean } = {},
  ) =>
    apiClient.get<{
      transactions?: WalletTransactionApiItem[];
      total?: number;
      offset?: number;
      limit?: number;
      isEnd?: boolean;
    }>(`/api/v1/apps/${appPrefix}/wallet/transaction-history/customer`, input).then((response) => ({
      data: (response.transactions ?? []).map(mapWalletTransaction),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
      isEnd: response.isEnd,
    })),
};

export const walletSavedCardsKeys = {
  all: ['wallet-saved-cards'] as const,
  byApp: (appPrefix: ProfileAppPrefix) =>
    [...walletSavedCardsKeys.all, appPrefix] as const,
  transactionsByApp: (
    appPrefix: ProfileAppPrefix,
    input: { offset?: number; limit?: number } = {},
  ) =>
    [...walletSavedCardsKeys.all, appPrefix, 'transactions', input.offset ?? 0, input.limit ?? 20] as const,
  statementByApp: (appPrefix: ProfileAppPrefix, filter: WalletStatementFilter) =>
    [...walletSavedCardsKeys.all, appPrefix, 'statement', filter] as const,
};

export function useWalletSavedCardsQuery(appPrefix: ProfileAppPrefix) {
  return useQuery({
    queryKey: walletSavedCardsKeys.byApp(appPrefix),
    queryFn: () => walletSavedCardsService.listSavedCards(appPrefix),
    staleTime: 60 * 1000,
  });
}

export function useWalletSetupIntentMutation(appPrefix: ProfileAppPrefix) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => walletSavedCardsService.createSetupIntent(appPrefix),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletSavedCardsKeys.byApp(appPrefix) });
    },
  });
}

export function useWalletSetDefaultCardMutation(appPrefix: ProfileAppPrefix) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      walletSavedCardsService.setDefaultSavedCard(appPrefix, paymentMethodId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletSavedCardsKeys.byApp(appPrefix) });
    },
  });
}

export function useWalletTransactionsQuery(
  appPrefix: ProfileAppPrefix,
  input: { offset?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: walletSavedCardsKeys.transactionsByApp(appPrefix, input),
    queryFn: () => walletSavedCardsService.listTransactions(appPrefix, { ...input, statement: true }),
    staleTime: 60 * 1000,
  });
}

export function useWalletStatementQuery(appPrefix: ProfileAppPrefix, filter: WalletStatementFilter) {
  const pageSize = 25;
  return useInfiniteQuery({
    queryKey: walletSavedCardsKeys.statementByApp(appPrefix, filter),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => walletSavedCardsService.listTransactions(appPrefix, {
      offset: pageParam,
      limit: pageSize,
      statement: true,
      ...(filter === 'all' ? {} : { filter }),
    }),
    getNextPageParam: (lastPage) => {
      const nextOffset = (lastPage.offset ?? 0) + lastPage.data.length;
      if (lastPage.isEnd || lastPage.data.length < pageSize || (lastPage.total !== undefined && nextOffset >= lastPage.total)) {
        return undefined;
      }
      return nextOffset;
    },
  });
}
