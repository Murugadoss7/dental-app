import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const patientService = {
    getAll: () => api.get('/patients'),
    getById: (id: string) => api.get(`/patients/${id}`),
    create: (data: Omit<Patient, 'id'>) => api.post('/patients', data),
}

export const appointmentService = {
    getAll: () => api.get('/appointments'),
    create: (data: Omit<Appointment, 'id'>) => api.post('/appointments', data),
}