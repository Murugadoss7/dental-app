export interface Doctor {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    specialization: string;
    license_number: string;
    schedule?: {
        monday?: WorkingHours;
        tuesday?: WorkingHours;
        wednesday?: WorkingHours;
        thursday?: WorkingHours;
        friday?: WorkingHours;
        saturday?: WorkingHours;
        sunday?: WorkingHours;
    };
    created_at: string;
    updated_at: string;
}

interface WorkingHours {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    is_available: boolean;
} 