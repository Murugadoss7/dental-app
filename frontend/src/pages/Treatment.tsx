import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TreatmentSession } from '../components/treatments/TreatmentSession';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { patientService } from '@/services/api';
import type { Patient } from '@/types/patient';

// TODO: Replace with proper authentication
const TEMP_DOCTOR_ID = "6558e65d2b2d4a9b4d0e0f1a";

export default function Treatment() {
    const { patientId } = useParams<{ patientId: string }>();

    const { data: patient, isLoading } = useQuery<Patient>({
        queryKey: ['patient', patientId],
        queryFn: () => patientService.getById(patientId!),
        enabled: !!patientId
    });

    if (!patientId) {
        return <div>Patient ID is required</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!patient) {
        return <div>Patient not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>
                        Patient: {patient.first_name} {patient.last_name}
                    </CardTitle>
                </CardHeader>
            </Card>
            <TreatmentSession patientId={patientId} doctorId={TEMP_DOCTOR_ID} />
        </div>
    );
} 