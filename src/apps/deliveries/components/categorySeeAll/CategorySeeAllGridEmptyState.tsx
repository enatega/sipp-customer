import React from 'react';
import { useTranslation } from 'react-i18next';
import ListStateView from '../../../../general/components/filterablePaginatedList/ListStateView';

export default function CategorySeeAllGridEmptyState() {
  const { t } = useTranslation('deliveries');
  return (
    <ListStateView
      description={t('generic_list_empty_description')}
      title={t('generic_list_empty_title')}
      variant="empty"
    />
  );
}
