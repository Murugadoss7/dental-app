import apiClient from '@/lib/api-client';
import type { Appointment } from '@/types/appointment';

export const appointmentService = {
    getAll: async () => (
        await apiClient.get<Appointment[]>('/appointments')
    ).data,

    getById: async (id: string) => (
        await apiClient.get<Appointment>(`/appointments/${id}`)
    ).data,

    create: async (data: Omit<Appointment, 'id'>) => (
        await apiClient.post<Appointment>('/appointments', data)
    ).data,

    update: async (id: string, data: Partial<Appointment>) => (
        await apiClient.put<Appointment>(`/appointments/${id}`, data)
    ).data,

    delete: async (id: string) => (
        await apiClient.delete(`/appointments/${id}`)
    ).data,

    getTodayAppointments: async () => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        return (
            await apiClient.get<Appointment[]>(`/appointments?start_time=${startOfDay}&end_time=${endOfDay}`)
        ).data;
    },

    cancel: async (id: string, reason: string) => (
        await apiClient.post<Appointment>(`/appointments/${id}/cancel`, { reason })
    ).data,

    reschedule: async (id: string, newDate: string) => (
        await apiClient.post<Appointment>(`/appointments/${id}/reschedule`, { new_date: newDate })
    ).data,
}; 