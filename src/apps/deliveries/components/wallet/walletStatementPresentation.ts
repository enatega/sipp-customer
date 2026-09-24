import type { WalletTransaction, WalletTransactionReason } from '../../../../general/api/walletSavedCardsService';

export const statementTitleKeys: Record<WalletTransactionReason, string> = {
  card_topup: 'wallet_statement_card_topup',
  order_payment: 'wallet_statement_order_payment',
  order_refund: 'wallet_statement_order_refund',
  loyalty_conversion: 'wallet_statement_loyalty_conversion',
  opening_balance: 'wallet_statement_opening_balance',
  credit: 'wallet_statement_credit',
  debit: 'wallet_statement_debit',
  withdrawal: 'wallet_statement_withdrawal',
  unknown: 'wallet_statement_unknown',
};

export const statementDescriptionKeys: Record<WalletTransactionReason, string> = {
  card_topup: 'wallet_statement_card_topup_description',
  order_payment: 'wallet_statement_order_payment_description',
  order_refund: 'wallet_statement_order_refund_description',
  loyalty_conversion: 'wallet_statement_loyalty_conversion_description',
  opening_balance: 'wallet_statement_opening_balance_description',
  credit: 'wallet_statement_credit_description',
  debit: 'wallet_statement_debit_description',
  withdrawal: 'wallet_statement_withdrawal_description',
  unknown: 'wallet_statement_unknown_description',
};

export function formatWalletStatementAmount(transaction: WalletTransaction, currency: string, locale?: string) {
  if (transaction.amount === undefined) return '';
  const sign = transaction.direction === 'credit' ? '+' : transaction.direction === 'debit' ? '−' : '';
  const amount = Math.abs(transaction.amount).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${amount}`;
}

export function formatWalletStatementDate(value: string, full = false, locale?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, full
    ? { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}
