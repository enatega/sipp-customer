type Translate = (key: string) => string;

const GROCERY_NAMES = new Set([
  'grocery',
  'groceries',
  'grocery store',
  'épicerie',
  'epicerie',
  'supermercado',
  'lebensmittelgeschäft',
  'lebensmittelgeschaft',
  'بقالة',
]);

const RESTAURANT_NAMES = new Set([
  'restaurant',
  'restaurants',
  'restaurante',
  'مطعم',
]);

export function decodeShopTypeName(value: string) {
  let decodedValue = value;

  if (decodedValue.includes('%')) {
    try {
      decodedValue = decodeURIComponent(decodedValue);
    } catch {
      decodedValue = value;
    }
  }

  return decodedValue.replace(/%amp;|&amp;|&#38;/gi, '&').trim();
}

export function translateShopTypeName(value: string, t: Translate) {
  const decodedValue = decodeShopTypeName(value);
  const normalizedValue = decodedValue.toLocaleLowerCase('en').replace(/[\s_-]+/g, ' ').trim();

  if (GROCERY_NAMES.has(normalizedValue)) {
    return t('shop_type_grocery');
  }

  if (RESTAURANT_NAMES.has(normalizedValue)) {
    return t('shop_type_restaurant');
  }

  return decodedValue;
}
