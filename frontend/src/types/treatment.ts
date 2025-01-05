export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface Prescription {
    _id: string;
    treatment_id: string;
    medications: Medication[];
    date: string;
}

export interface Procedure {
    description: string;
    estimated_cost: number;
    status: 'planned' | 'completed' | 'cancelled';
    priority: 'high' | 'medium' | 'low';
}

export interface TreatmentPlan {
    _id: string;
    patient_id: string;
    procedures: Procedure[];
    start_date: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface Treatment {
    _id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    chief_complaint: string;
    diagnosis: string;
    clinical_findings: string;
    treatment_notes: string;
    teeth_involved: string[];
    attachments?: string[];
    created_at: string;
    updated_at: string;
} 