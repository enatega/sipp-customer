import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StoreMenuBootstrap } from '../../api/storeMenuService';
import { ApiError } from '../../../../general/api/apiClient';
import { deliveryKeys, favouriteKeys } from '../../api/queryKeys';
import {
    favouritesService,
    type ToggleFavouriteParams,
    type ToggleFavouriteResponse,
} from '../api/favouritesService';

type Options = {
    storeId?: string;
    onSuccess?: (data: ToggleFavouriteResponse) => void;
    onError?: (error: ApiError) => void;
};

export function useToggleFavouriteMutation(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation<ToggleFavouriteResponse, ApiError, ToggleFavouriteParams>({
        mutationFn: favouritesService.toggleFavourite,
        retry: false,
        onSuccess: (data, variables) => {
            if (__DEV__) console.log('[Deliveries][Favourites] mutation success', {
                data,
                variables,
            });
            // Invalidate favourites list screen
            queryClient.invalidateQueries({ queryKey: favouriteKeys.list() });

            // Refetch the storeView so isFavorited is up-to-date on next render
            if (options?.storeId) {
                queryClient.invalidateQueries({
                    queryKey: deliveryKeys.storeView(options.storeId),
                });
                queryClient.setQueryData<StoreMenuBootstrap>(deliveryKeys.storeMenu(options.storeId), (current) =>
                    current ? { ...current, store: { ...current.store, isFavorited: data.isFavorite } } : current,
                );
            }

            options?.onSuccess?.(data);
        },
        onError: (error, variables) => {
            console.error('[Deliveries][Favourites] mutation error', {
                message: error.message,
                status: error.status,
                code: error.code,
                data: error.data,
                variables,
            });
            options?.onError?.(error);
        },
    });
}
