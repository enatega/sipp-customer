type ProductNameSource = {
  name?: string | null;
  nameTranslations?: Record<string, string> | null;
};

export function getLocalizedProductName(
  product: ProductNameSource,
  language: string,
): string {
  const code = language.trim().toLowerCase().split('-')[0];
  return (
    product.nameTranslations?.[code]?.trim() ||
    product.nameTranslations?.en?.trim() ||
    product.name?.trim() ||
    ''
  );
}
