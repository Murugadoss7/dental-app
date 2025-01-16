import apiClient from '@/lib/api-client';
import type { Patient } from '@/types/patient';

export const patientService = {
    getAll: async () => (
        await apiClient.get<Patient[]>('/patients')
    ).data,

    getById: async (id: string) => (
        await apiClient.get<Patient>(`/patients/${id}`)
    ).data,

    create: async (data: Omit<Patient, 'id'>) => (
        await apiClient.post<Patient>('/patients', data)
    ).data,

    update: async (id: string, data: Partial<Patient>) => (
        await apiClient.put<Patient>(`/patients/${id}`, data)
    ).data,

    delete: async (id: string) => (
        await apiClient.delete(`/patients/${id}`)
    ).data,
}; 