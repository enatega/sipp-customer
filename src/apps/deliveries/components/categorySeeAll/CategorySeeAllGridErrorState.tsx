import React from 'react';
import { useTranslation } from 'react-i18next';
import ListStateView from '../../../../general/components/filterablePaginatedList/ListStateView';

type Props = {
  isRetrying?: boolean;
  onRetry: () => void;
};

export default function CategorySeeAllGridErrorState({
  isRetrying = false,
  onRetry,
}: Props) {
  const { t } = useTranslation('deliveries');

  return (
    <ListStateView
      actionLabel={isRetrying ? undefined : t('generic_list_retry')}
      description={t('generic_list_error_description')}
      onActionPress={onRetry}
      title={t('generic_list_error_title')}
      variant="error"
    />
  );
}
