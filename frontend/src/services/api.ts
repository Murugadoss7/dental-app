import apiClient from '@/lib/api-client';
import type { Patient } from '@/types/patient';
import type { Appointment } from '@/types/appointment';
import type { Treatment, TreatmentPlan, Prescription, DentalCatalogItem, ClinicalFinding } from '@/types/treatment';

// Patient Service
export const patientService = {
    getAll: async () => (await apiClient.get<Patient[]>('/patients')).data,
    getById: async (id: string) => (await apiClient.get<Patient>(`/patients/${id}`)).data,
    create: async (data: Omit<Patient, 'id'>) => (await apiClient.post<Patient>('/patients', data)).data,
    update: async (id: string, data: Partial<Patient>) => (await apiClient.put<Patient>(`/patients/${id}`, data)).data,
    delete: async (id: string) => (await apiClient.delete(`/patients/${id}`)).data,
};

// Appointment Service
export const appointmentService = {
    getAll: async () => (await apiClient.get<Appointment[]>('/appointments')).data,
    getById: async (id: string) => (await apiClient.get<Appointment>(`/appointments/${id}`)).data,
    create: async (data: Omit<Appointment, 'id'>) => (await apiClient.post<Appointment>('/appointments', data)).data,
    update: async (id: string, data: Partial<Appointment>) => (await apiClient.put<Appointment>(`/appointments/${id}`, data)).data,
    delete: async (id: string) => (await apiClient.delete(`/appointments/${id}`)).data,
    getTodayAppointments: async () => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        return (await apiClient.get<Appointment[]>(`/appointments?start_time=${startOfDay}&end_time=${endOfDay}`)).data;
    },
    cancel: async (id: string, reason: string) => (await apiClient.post<Appointment>(`/appointments/${id}/cancel`, { reason })).data,
    reschedule: async (id: string, newDate: string) => (await apiClient.post<Appointment>(`/appointments/${id}/reschedule`, { new_date: newDate })).data,
};

// Treatment Service
export const treatmentService = {
    // Treatment endpoints
    create: async (treatment: Partial<Treatment>) => (await apiClient.post<Treatment>('/treatments', treatment)).data,
    getById: async (id: string) => (await apiClient.get<Treatment>(`/treatments/${id}`)).data,
    getByPatient: async (patientId: string) => (await apiClient.get<Treatment[]>(`/treatments/patient/${patientId}`)).data,
    update: async (id: string, treatment: Partial<Treatment>) => (await apiClient.put<Treatment>(`/treatments/${id}`, treatment)).data,

    // Treatment Plan endpoints
    createPlan: async (plan: Partial<TreatmentPlan>) => (await apiClient.post<TreatmentPlan>('/treatments/plans', plan)).data,
    getPatientPlans: async (patientId: string) => (await apiClient.get<TreatmentPlan[]>(`/treatments/plans/patient/${patientId}`)).data,
    updatePlan: async (id: string, plan: Partial<TreatmentPlan>) => (await apiClient.put<TreatmentPlan>(`/treatments/plans/${id}`, plan)).data,
    createTreatmentPlanFromFindings: async (patientId: string, findings: ClinicalFinding[]) => (
        await apiClient.post<TreatmentPlan>('/treatments/plans/from-findings', { patient_id: patientId, findings })
    ).data,

    // Prescription endpoints
    createPrescription: async (prescription: Partial<Prescription>) => (await apiClient.post<Prescription>('/treatments/prescriptions', prescription)).data,
    getTreatmentPrescriptions: async (treatmentId: string) => (await apiClient.get<Prescription[]>(`/treatments/prescriptions/${treatmentId}`)).data,
};

// Dental Catalog Service
export const dentalCatalogService = {
    getAll: async (type?: 'category' | 'treatment') =>
        (await apiClient.get<DentalCatalogItem[]>(type ? `/dental-catalog?type=${type}` : '/dental-catalog')).data,
    getCommon: async (type?: 'category' | 'treatment') =>
        (await apiClient.get<DentalCatalogItem[]>(type ? `/dental-catalog/common?type=${type}` : '/dental-catalog/common')).data,
    create: async (item: Partial<DentalCatalogItem>) => (await apiClient.post<DentalCatalogItem>('/dental-catalog', item)).data,
    update: async (id: string, item: Partial<DentalCatalogItem>) => (await apiClient.put<DentalCatalogItem>(`/dental-catalog/${id}`, item)).data,
    delete: async (id: string) => (await apiClient.delete(`/dental-catalog/${id}`)).data,
}; 