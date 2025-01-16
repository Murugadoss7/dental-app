import api from '@/lib/api-client';
import type { Treatment, TreatmentPlan, Prescription, DentalCatalogItem } from '@/types/treatment';

export const treatmentService = {
    // Treatment endpoints
    createTreatment: async (treatment: Partial<Treatment>) => {
        const response = await api.post<Treatment>('/treatments', treatment);
        return response.data;
    },

    getTreatment: async (id: string) => {
        const response = await api.get<Treatment>(`/treatments/${id}`);
        return response.data;
    },

    getPatientTreatments: async (patientId: string) => {
        const response = await api.get<Treatment[]>(`/treatments/patient/${patientId}`);
        return response.data;
    },

    updateTreatment: async (id: string, treatment: Partial<Treatment>) => {
        const response = await api.put<Treatment>(`/treatments/${id}`, treatment);
        return response.data;
    },

    // Treatment Plan endpoints
    createTreatmentPlan: async (plan: Partial<TreatmentPlan>) => {
        const response = await api.post<TreatmentPlan>('/treatments/plans', plan);
        return response.data;
    },

    getPatientTreatmentPlans: async (patientId: string) => {
        const response = await api.get<TreatmentPlan[]>(`/treatments/plans/patient/${patientId}`);
        return response.data;
    },

    updateTreatmentPlan: async (id: string, plan: Partial<TreatmentPlan>) => {
        const response = await api.put<TreatmentPlan>(`/treatments/plans/${id}`, plan);
        return response.data;
    },

    // Prescription endpoints
    createPrescription: async (prescription: Partial<Prescription>) => {
        const response = await api.post<Prescription>('/treatments/prescriptions', prescription);
        return response.data;
    },

    getTreatmentPrescriptions: async (treatmentId: string) => {
        const response = await api.get<Prescription[]>(`/treatments/prescriptions/${treatmentId}`);
        return response.data;
    },

    // Dental Catalog endpoints
    getCatalogItems: async (type?: 'category' | 'treatment') => {
        const response = await api.get<DentalCatalogItem[]>(
            type ? `/dental-catalog?type=${type}` : '/dental-catalog'
        );
        return response.data;
    },

    getCommonItems: async (type?: 'category' | 'treatment') => {
        const response = await api.get<DentalCatalogItem[]>(
            type ? `/dental-catalog/common?type=${type}` : '/dental-catalog/common'
        );
        return response.data;
    },

    createCatalogItem: async (item: Partial<DentalCatalogItem>) => {
        const response = await api.post<DentalCatalogItem>('/dental-catalog', item);
        return response.data;
    },

    updateCatalogItem: async (id: string, item: Partial<DentalCatalogItem>) => {
        const response = await api.put<DentalCatalogItem>(`/dental-catalog/${id}`, item);
        return response.data;
    },

    deleteCatalogItem: async (id: string) => {
        await api.delete(`/dental-catalog/${id}`);
    }
}; 