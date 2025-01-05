import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Treatment, Prescription, TreatmentPlan } from '@/types/treatment';
import { treatmentService } from '@/services/treatmentService';
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

export function TreatmentSession({ patientId, doctorId }: TreatmentSessionProps) {
    const [activeTab, setActiveTab] = useState('diagnosis');
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch patient's treatments
    const { data: treatments, isLoading: isLoadingTreatments } = useQuery({
        queryKey: ['treatments', patientId],
        queryFn: () => treatmentService.getPatientTreatments(patientId),
        enabled: !!patientId
    });

    // Fetch treatment plans
    const { data: treatmentPlans, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['treatmentPlans', patientId],
        queryFn: () => treatmentService.getPatientTreatmentPlans(patientId),
        enabled: !!patientId
    });

    // Fetch prescriptions for the latest treatment
    const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
        queryKey: ['prescriptions', treatments?.[0]?._id],
        queryFn: () => treatmentService.getTreatmentPrescriptions(treatments?.[0]?._id),
        enabled: !!treatments?.[0]?._id
    });

    // Create treatment mutation
    const createTreatmentMutation = useMutation({
        mutationFn: treatmentService.createTreatment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });
            toast({
                title: "Success",
                description: "Treatment record created successfully",
                variant: "default",
                duration: 3000,
            });
            setActiveTab('history'); // Switch to history tab after successful creation
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
        mutationFn: treatmentService.createTreatmentPlan,
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <ToothChart />
                            </div>
                            <div>
                                <DiagnosisForm
                                    onSubmit={(data) => {
                                        const treatmentData = {
                                            ...data,
                                            patient_id: patientId,
                                            doctor_id: doctorId,
                                            date: new Date().toISOString()
                                        };
                                        console.log('Submitting treatment:', treatmentData);
                                        createTreatmentMutation.mutate(treatmentData);
                                    }}
                                />
                            </div>
                        </div>
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
                            onSubmit={(data) => {
                                const planData = {
                                    ...data,
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