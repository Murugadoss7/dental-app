export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    createdAt: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    date: string;
    time: string;
    type: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}