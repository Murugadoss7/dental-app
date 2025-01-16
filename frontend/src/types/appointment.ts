import type { Patient } from './patient';
import type { Doctor } from './doctor';

export interface AppointmentRequest {
    patient_id: string;
    doctor_id: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    reason?: string;
    notes?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
    _id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
} 