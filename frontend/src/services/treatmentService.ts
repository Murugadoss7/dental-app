import axios from 'axios';
import { Treatment, Prescription, TreatmentPlan } from '@/types/treatment';

const API_URL = '/api';

export const treatmentService = {
    // Treatment endpoints
    createTreatment: async (treatment: Omit<Treatment, '_id' | 'created_at' | 'updated_at'>) => {
        const response = await axios.post<Treatment>(`${API_URL}/treatments`, treatment);
        return response.data;
    },

    getTreatment: async (id: string) => {
        const response = await axios.get<Treatment>(`${API_URL}/treatments/${id}`);
        return response.data;
    },

    getPatientTreatments: async (patientId: string) => {
        const response = await axios.get<Treatment[]>(`${API_URL}/treatments/patient/${patientId}`);
        return response.data;
    },

    updateTreatment: async (id: string, treatment: Partial<Treatment>) => {
        const response = await axios.put<Treatment>(`${API_URL}/treatments/${id}`, treatment);
        return response.data;
    },

    // Prescription endpoints
    createPrescription: async (prescription: Omit<Prescription, '_id'>) => {
        const response = await axios.post<Prescription>(`${API_URL}/treatments/prescriptions`, prescription);
        return response.data;
    },

    getTreatmentPrescriptions: async (treatmentId: string) => {
        const response = await axios.get<Prescription[]>(`${API_URL}/treatments/prescriptions/${treatmentId}`);
        return response.data;
    },

    // Treatment Plan endpoints
    createTreatmentPlan: async (plan: Omit<TreatmentPlan, '_id' | 'created_at' | 'updated_at'>) => {
        const response = await axios.post<TreatmentPlan>(`${API_URL}/treatments/plans`, plan);
        return response.data;
    },

    getPatientTreatmentPlans: async (patientId: string) => {
        const response = await axios.get<TreatmentPlan[]>(`${API_URL}/treatments/plans/patient/${patientId}`);
        return response.data;
    },

    updateTreatmentPlan: async (id: string, plan: Partial<TreatmentPlan>) => {
        const response = await axios.put<TreatmentPlan>(`${API_URL}/treatments/plans/${id}`, plan);
        return response.data;
    }
}; 