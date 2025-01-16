export interface Appointment {
    id: string;
    patientId: string;
    date: string;
    time: string;
    type: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}