export interface Patient {
    _id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    contact_number: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
    };
    medical_history?: {
        allergies: string[];
        conditions: string[];
        medications: string[];
    };
    created_at: string;
    updated_at: string;
} 