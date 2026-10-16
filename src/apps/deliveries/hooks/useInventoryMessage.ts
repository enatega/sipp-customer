import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../general/api/apiClient';

export function isInventoryError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === 'CART_INVENTORY_CHANGED';
}

export function useInventoryMessage() {
  const { t } = useTranslation('deliveries');
  return (error: unknown): string | null => {
    if (!isInventoryError(error)) return null;
    const data = error.data as { items?: unknown[] } | undefined;
    const lines = (Array.isArray(data?.items) ? data.items : []).flatMap(raw => {
      if (!raw || typeof raw !== 'object') return [];
      const item = raw as Record<string, unknown>;
      const name = typeof item.productName === 'string' ? item.productName : t('inventory_item');
      if (item.reason === 'out_of_stock') return [t('inventory_unavailable', { name })];
      if (item.reason === 'insufficient_stock' && typeof item.availableQuantity === 'number' && Number.isFinite(item.availableQuantity)
        && typeof item.requestedQuantity === 'number' && Number.isFinite(item.requestedQuantity)) {
        return [t('inventory_quantity', { name, available: Number(item.availableQuantity), requested: Number(item.requestedQuantity) })];
      }
      return [];
    });
    return [...lines, t('inventory_update_cart')].join('\n');
  };
}
