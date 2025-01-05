import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TreatmentSession } from '../components/treatments/TreatmentSession';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: Replace with proper authentication
const TEMP_DOCTOR_ID = "6558e65d2b2d4a9b4d0e0f1a";

export default function Treatment() {
    const { patientId } = useParams<{ patientId: string }>();

    const { data: patient, isLoading } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const response = await fetch(`/api/patients/${patientId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch patient');
            }
            return response.json();
        },
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