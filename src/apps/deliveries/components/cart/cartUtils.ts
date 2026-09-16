import type { CartItem, CartSelectedOption } from '../../api/cartServiceTypes';
import { getDeliveriesCurrencyLabel } from '../../../../general/stores/useAppConfigStore';

export function formatCartPrice(value?: number | null) {
  const currencyLabel = getDeliveriesCurrencyLabel();

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return `${currencyLabel} 0.00`;
  }

  return `${currencyLabel} ${value.toFixed(2)}`;
}

export function getCartSelectedOptionsLabel(selectedOptions: CartSelectedOption[]) {
  if (selectedOptions.length === 0) {
    return '';
  }

  return selectedOptions.map((option) => option.optionName).join(', ');
}

export function getCartItemSubtitle(item: CartItem) {
  const selectedOptionsLabel = getCartSelectedOptionsLabel(item.selectedOptions);

  if (selectedOptionsLabel) {
    return selectedOptionsLabel;
  }

  return item.description?.trim() ?? '';
}
