import apiClient from '@/lib/api-client';
import type { Treatment, TreatmentPlan, Prescription } from '@/types/treatment';

export const treatmentService = {
    // Treatment endpoints
    create: async (treatment: Partial<Treatment>) => (
        await apiClient.post<Treatment>('/treatments', treatment)
    ).data,

    getById: async (id: string) => (
        await apiClient.get<Treatment>(`/treatments/${id}`)
    ).data,

    getByPatient: async (patientId: string) => (
        await apiClient.get<Treatment[]>(`/treatments/patient/${patientId}`)
    ).data,

    update: async (id: string, treatment: Partial<Treatment>) => (
        await apiClient.put<Treatment>(`/treatments/${id}`, treatment)
    ).data,

    // Treatment Plan endpoints
    createPlan: async (plan: Partial<TreatmentPlan>) => (
        await apiClient.post<TreatmentPlan>('/treatments/plans', plan)
    ).data,

    getPatientPlans: async (patientId: string) => (
        await apiClient.get<TreatmentPlan[]>(`/treatments/plans/patient/${patientId}`)
    ).data,

    updatePlan: async (id: string, plan: Partial<TreatmentPlan>) => (
        await apiClient.put<TreatmentPlan>(`/treatments/plans/${id}`, plan)
    ).data,

    // Prescription endpoints
    createPrescription: async (prescription: Partial<Prescription>) => (
        await apiClient.post<Prescription>('/treatments/prescriptions', prescription)
    ).data,

    getTreatmentPrescriptions: async (treatmentId: string) => (
        await apiClient.get<Prescription[]>(`/treatments/prescriptions/${treatmentId}`)
    ).data,
}; 