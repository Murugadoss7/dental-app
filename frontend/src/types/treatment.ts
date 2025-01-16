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

export interface TeethGroup {
    group: 'upper' | 'lower';
    numbers: string[];
}

export interface TreatmentPlanItem {
    finding_id?: string;
    treatment_name: string;
    teeth_involved?: TeethGroup;
    category: string;
    finding_notes?: string;
    estimated_cost?: number;
    scheduled_date?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'high' | 'medium' | 'low';
}

export interface TreatmentPlan {
    _id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    treatments: TreatmentPlanItem[];
    status: 'pending' | 'in-progress' | 'completed';
    total_cost: number;
    created_at: string;
    updated_at: string;
}

export interface Issue {
    id?: string;
    name: string;
    is_custom: boolean;
}

export interface RecommendedTreatment {
    id?: string;
    name: string;
    is_custom: boolean;
}

export interface ClinicalFinding {
    teeth: {
        numbers: string[];
        group: 'upper' | 'lower';
    };
    issue: DentalCatalogItem;
    finding: string;
    recommended_treatment: DentalCatalogItem;
}

export interface Treatment {
    _id: string;
    patient_id: string;
    doctor_id: string;
    date: string;
    chief_complaint: string;
    diagnosis: string;
    clinical_findings: ClinicalFinding[];
    treatment_notes: string;
    teeth_involved: string[];
    created_at: string;
    updated_at: string;
}

export interface DentalCatalogItem {
    _id: string;
    name: string;
    type: 'category' | 'treatment';
    description?: string;
    base_cost?: number;
    is_common?: boolean;
    created_at: string;
    updated_at: string;
}