import apiClient from '@/lib/api-client';
import type { DentalCatalogItem } from '@/types/treatment';

export const dentalCatalogService = {
    getAll: async (type?: 'category' | 'treatment') => (
        await apiClient.get<DentalCatalogItem[]>(
            type ? `/dental-catalog?type=${type}` : '/dental-catalog'
        )
    ).data,

    getCommonItems: async (type?: 'category' | 'treatment') => (
        await apiClient.get<DentalCatalogItem[]>(
            type ? `/dental-catalog/common?type=${type}` : '/dental-catalog/common'
        )
    ).data,

    create: async (item: Partial<DentalCatalogItem>) => (
        await apiClient.post<DentalCatalogItem>('/dental-catalog', item)
    ).data,
}; 