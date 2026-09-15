import React from 'react';
import SearchInput from '../../../../../general/components/search/SearchInput';
import SeeAllHeader from '../../../../../general/screens/SeeAllScreen/components/SeeAllHeader';
import type { GenericListHeaderRenderProps } from '../../../../../general/components/filterablePaginatedList';

type Props = Omit<GenericListHeaderRenderProps, 'renderSearchInput'>;

export default function DeliveriesSeeAllHeader(props: Props) {
  return (
    <SeeAllHeader
      {...props}
      renderSearchInput={({ value, onChangeText, placeholder, editable }) => (
        <SearchInput
          editable={editable}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
        />
      )}
    />
  );
}
