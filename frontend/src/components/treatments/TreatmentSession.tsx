import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Treatment, Prescription, TreatmentPlan, TreatmentPlanItem } from '@/types/treatment';
import { treatmentService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToothChart } from './ToothChart';
import { DiagnosisForm } from './DiagnosisForm';
import { PrescriptionForm } from './PrescriptionForm';
import { TreatmentPlanForm } from './TreatmentPlanForm';
import { TreatmentHistory } from './TreatmentHistory';
import { useToast } from '@/components/ui/use-toast';

interface TreatmentSessionProps {
    patientId: string;
    doctorId: string;
}

interface TreatmentPlanFormProps {
    treatments: TreatmentPlanItem[];
    onUpdate: (treatments: TreatmentPlanItem[]) => void;
}

export function TreatmentSession({ patientId, doctorId }: TreatmentSessionProps) {
    const [activeTab, setActiveTab] = useState('diagnosis');
    const [pendingTreatments, setPendingTreatments] = useState<TreatmentPlanItem[]>([]);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch patient's treatments
    const { data: treatments, isLoading: isLoadingTreatments } = useQuery({
        queryKey: ['treatments', patientId],
        queryFn: async () => {
            console.log('Fetching treatments for patient:', patientId);
            const result = await treatmentService.getByPatient(patientId);
            console.log('Treatments result:', result);
            return result;
        },
        enabled: !!patientId
    });

    // Fetch treatment plans
    const { data: treatmentPlans, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['treatmentPlans', patientId],
        queryFn: async () => {
            console.log('Fetching treatment plans for patient:', patientId);
            const result = await treatmentService.getPatientPlans(patientId);
            console.log('Treatment plans result:', result);
            return result;
        },
        enabled: !!patientId
    });

    // Fetch prescriptions for the latest treatment
    const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
        queryKey: ['prescriptions', treatments?.[0]?._id],
        queryFn: async () => {
            const treatmentId = treatments?.[0]?._id;
            console.log('Fetching prescriptions for treatment:', treatmentId);
            if (!treatmentId) return [];
            const result = await treatmentService.getTreatmentPrescriptions(treatmentId);
            console.log('Prescriptions result:', result);
            return result;
        },
        enabled: !!treatments?.[0]?._id
    });

    console.log('Current data state:', {
        treatments,
        treatmentPlans,
        prescriptions,
        isLoading: isLoadingTreatments || isLoadingPlans || isLoadingPrescriptions
    });

    // Create treatment mutation
    const createTreatmentMutation = useMutation({
        mutationFn: (data: Partial<Treatment>) => treatmentService.create(data),
        onSuccess: (createdTreatment) => {
            queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });

            // Convert clinical findings to treatment plan items
            const treatmentItems: TreatmentPlanItem[] = createdTreatment.clinical_findings.map(finding => ({
                finding_id: finding.id,
                treatment_name: finding.recommended_treatment.name,
                teeth_involved: {
                    group: finding.teeth.group,
                    numbers: finding.teeth.numbers
                },
                category: finding.issue.name,
                finding_notes: finding.finding,
                estimated_cost: 0,
                status: 'planned',
                priority: 'medium'
            }));

            setPendingTreatments(treatmentItems);

            toast({
                title: "Success",
                description: "Treatment record created successfully",
                variant: "default",
                duration: 3000,
            });
            setActiveTab('treatment-plan'); // Switch to treatment plan tab to set costs and schedule
        },
        onError: (error: any) => {
            console.error('Treatment creation error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create treatment record",
                variant: "destructive",
                duration: 5000,
            });
        }
    });

    // Create prescription mutation
    const createPrescriptionMutation = useMutation({
        mutationFn: treatmentService.createPrescription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });
            toast({
                title: "Success",
                description: "Prescription created successfully",
                variant: "default",
                duration: 3000,
            });
            setActiveTab('history');
        },
        onError: (error: any) => {
            console.error('Prescription creation error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create prescription",
                variant: "destructive",
                duration: 5000,
            });
        }
    });

    // Create treatment plan mutation
    const createTreatmentPlanMutation = useMutation({
        mutationFn: (data: Partial<TreatmentPlan>) => treatmentService.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['treatmentPlans', patientId] });
            toast({
                title: "Success",
                description: "Treatment plan created successfully",
                variant: "default",
                duration: 3000,
            });
            setActiveTab('history');
        },
        onError: (error: any) => {
            console.error('Treatment plan creation error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create treatment plan",
                variant: "destructive",
                duration: 5000,
            });
        }
    });

    if (isLoadingTreatments || isLoadingPlans || isLoadingPrescriptions) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Treatment Session</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                        <TabsTrigger value="prescription">Prescription</TabsTrigger>
                        <TabsTrigger value="treatment-plan">Treatment Plan</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="diagnosis">
                        <DiagnosisForm
                            onSubmit={async (data) => {
                                try {
                                    // Create treatment record
                                    const treatmentData = {
                                        patient_id: patientId,
                                        doctor_id: doctorId,
                                        date: new Date().toISOString(),
                                        chief_complaint: data.chief_complaint,
                                        diagnosis: data.diagnosis,
                                        clinical_findings: data.clinical_findings,
                                        teeth_involved: data.clinical_findings.flatMap(f => f.teeth.numbers),
                                        treatment_notes: data.clinical_findings
                                            .map(f => `${f.issue.name}: ${f.finding}\nRecommended Treatment: ${f.recommended_treatment.name}`)
                                            .join('\n\n')
                                    };

                                    // Save the treatment record
                                    await createTreatmentMutation.mutateAsync(treatmentData);

                                    toast({
                                        title: "Success",
                                        description: "Treatment record created successfully",
                                        variant: "default",
                                        duration: 3000,
                                    });
                                    setActiveTab('history'); // Switch to history tab to see the created treatment
                                } catch (error: any) {
                                    console.error('Treatment creation error:', error);
                                    toast({
                                        title: "Error",
                                        description: error.response?.data?.detail || "Failed to create treatment record",
                                        variant: "destructive",
                                        duration: 5000,
                                    });
                                }
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="prescription">
                        <PrescriptionForm
                            onSubmit={(data) => {
                                if (treatments?.[0]?._id) {
                                    const prescriptionData = {
                                        ...data,
                                        treatment_id: treatments[0]._id,
                                        date: new Date().toISOString()
                                    };
                                    console.log('Submitting prescription:', prescriptionData);
                                    createPrescriptionMutation.mutate(prescriptionData);
                                } else {
                                    toast({
                                        title: "Error",
                                        description: "No treatment record found. Please create a diagnosis first.",
                                        variant: "destructive",
                                        duration: 5000,
                                    });
                                }
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="treatment-plan">
                        <TreatmentPlanForm
                            treatments={pendingTreatments}
                            onUpdate={(updatedTreatments) => {
                                // Just update the local state
                                setPendingTreatments(updatedTreatments);
                            }}
                            onSave={(treatments) => {
                                // Create the treatment plan only when save is clicked
                                const planData = {
                                    treatments,
                                    patient_id: patientId,
                                    start_date: new Date().toISOString()
                                };
                                console.log('Submitting treatment plan:', planData);
                                createTreatmentPlanMutation.mutate(planData);
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="history">
                        <TreatmentHistory
                            treatments={treatments || []}
                            treatmentPlans={treatmentPlans || []}
                            prescriptions={prescriptions || []}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 