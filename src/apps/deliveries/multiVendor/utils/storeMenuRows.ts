import type { StoreMenuPage, StoreMenuSection } from '../../api/storeMenuService';
import type { DeliveryStoreDetailsProduct, DeliveryStoreDetailsFilterItem } from '../../api/types';

export type StoreMenuRow =
  | { id: string; type: 'category' | 'subcategory'; title: string; sectionId: string; categoryId: string; subcategoryId: string | null }
  | { id: string; type: 'product'; product: DeliveryStoreDetailsProduct; sectionId: string; categoryId: string; subcategoryId: string | null };

export function buildStoreMenuRows(pages: StoreMenuPage[], sections: StoreMenuSection[], categories: DeliveryStoreDetailsFilterItem[]): StoreMenuRow[] {
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const seen = new Set<string>();
  const rows: StoreMenuRow[] = [];
  let previousCategory: string | undefined;
  let previousSection: string | undefined;
  for (const page of pages) {
    const section = sectionById.get(page.sectionId);
    if (!section) continue;
    const context = { sectionId: section.id, categoryId: section.categoryId, subcategoryId: section.subcategoryId };
    if (section.categoryId !== previousCategory) {
      rows.push({ ...context, id: `category:${section.categoryId}`, type: 'category', title: categoryById.get(section.categoryId)?.name ?? section.name });
      previousCategory = section.categoryId;
    }
    if (section.id !== previousSection && section.subcategoryId) {
      rows.push({ ...context, id: `section:${section.id}`, type: 'subcategory', title: section.name });
    }
    previousSection = section.id;
    for (const product of page.items) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      rows.push({ ...context, id: product.id, type: 'product', product });
    }
  }
  return rows;
}

export type StoreMenuListRow = StoreMenuRow | {
  [Kind in 'hero' | 'toolbar' | 'loading' | 'empty' | 'error']: { id: string; type: Kind }
}['hero' | 'toolbar' | 'loading' | 'empty' | 'error'];
