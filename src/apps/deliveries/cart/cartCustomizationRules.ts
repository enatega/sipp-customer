import type { CartSelectionInput } from '../api/cartServiceTypes';
import type {
  ProductInfoCustomizationsResponse,
  ProductInfoCustomizationSection,
} from '../api/productInfoServiceTypes';

export type CartCustomizationSummary = {
  hasCustomizations: boolean;
  hasRequiredGroups: boolean;
  isSelectionComplete: boolean;
  requiredGroupIds: string[];
};

export function isCustomizationSectionRequired(
  section: Pick<ProductInfoCustomizationSection, 'minSelect' | 'required'>,
) {
  return section.required || section.minSelect > 0;
}

export function summarizeCartCustomizations(
  customizations?: ProductInfoCustomizationsResponse | null,
  selectedOptions?: CartSelectionInput[],
): CartCustomizationSummary {
  const selectedOptionCountByGroup = (selectedOptions ?? []).reduce<Record<string, number>>(
    (counts, option) => {
      counts[option.groupId] = (counts[option.groupId] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const variationSections = customizations?.variations ?? [];
  const addonSections = customizations?.addons ?? [];
  const requiredAddonGroupIds = addonSections
    .filter((section) => isCustomizationSectionRequired(section))
    .map((section) => section.groupId);
  const hasRequiredVariationChoice = variationSections.some((section) =>
    isCustomizationSectionRequired(section),
  );
  const hasSelectedVariation = variationSections.some((section) =>
    (selectedOptionCountByGroup[section.groupId] ?? 0) > 0,
  );
  const hasRequiredAddons = requiredAddonGroupIds.length > 0;
  const isAddonSelectionComplete = addonSections
    .filter((section) => isCustomizationSectionRequired(section))
    .every(
      (section) =>
        (selectedOptionCountByGroup[section.groupId] ?? 0) >=
        Math.max(1, section.minSelect),
    );
  const hasRequiredGroups = hasRequiredVariationChoice || hasRequiredAddons;
  const requiredGroupIds = [
    ...(hasRequiredVariationChoice ? ['__variation__'] : []),
    ...requiredAddonGroupIds,
  ];

  return {
    hasCustomizations: variationSections.length + addonSections.length > 0,
    hasRequiredGroups,
    isSelectionComplete:
      (!hasRequiredVariationChoice || hasSelectedVariation) && isAddonSelectionComplete,
    requiredGroupIds,
  };
}
