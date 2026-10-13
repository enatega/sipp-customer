import type { CartSelectionInput } from '../../api/cartServiceTypes';
import type { ProductInfoCustomizationsResponse } from '../../api/productInfoServiceTypes';

// Null means the product needs the existing details screen for a customer choice.
export function getStoreMenuQuickAddSelection(
  customizations: ProductInfoCustomizationsResponse,
): CartSelectionInput[] | null {
  if (customizations.addons.length > 0 || customizations.variations.length > 1) {
    return null;
  }

  const variation = customizations.variations[0];
  if (!variation) return [];
  if (variation.options.length !== 1) return null;

  return [{ groupId: variation.groupId, optionId: variation.options[0].optionId }];
}
