import { useState } from 'react';
import { format } from 'date-fns';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Treatment, TreatmentPlan, Prescription } from '@/types/treatment';

interface TreatmentHistoryProps {
    treatments: Treatment[];
    treatmentPlans: TreatmentPlan[];
    prescriptions: Prescription[];
}

export function TreatmentHistory({ treatments, treatmentPlans, prescriptions }: TreatmentHistoryProps) {
    const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'PPP');
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'planned':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-4">Treatment History</h3>
                <Accordion type="single" collapsible>
                    {treatments.map((treatment) => (
                        <AccordionItem key={treatment._id} value={treatment._id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                    <span>{formatDate(treatment.date)}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 p-4">
                                    <div>
                                        <h4 className="font-medium">Chief Complaint</h4>
                                        <p className="text-gray-600">{treatment.chief_complaint}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Diagnosis</h4>
                                        <p className="text-gray-600">{treatment.diagnosis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Clinical Findings</h4>
                                        <p className="text-gray-600">{treatment.clinical_findings}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Treatment Notes</h4>
                                        <p className="text-gray-600">{treatment.treatment_notes}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Teeth Involved</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {treatment.teeth_involved.map((tooth) => (
                                                <Badge key={tooth} variant="secondary">
                                                    {tooth}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {prescriptions.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">Prescriptions</h4>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Medication</TableHead>
                                                        <TableHead>Dosage</TableHead>
                                                        <TableHead>Frequency</TableHead>
                                                        <TableHead>Duration</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {prescriptions
                                                        .filter(p => p.treatment_id === treatment._id)
                                                        .map((prescription) => (
                                                            prescription.medications.map((med, idx) => (
                                                                <TableRow key={`${prescription._id}-${idx}`}>
                                                                    <TableCell>{med.name}</TableCell>
                                                                    <TableCell>{med.dosage}</TableCell>
                                                                    <TableCell>{med.frequency}</TableCell>
                                                                    <TableCell>{med.duration}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Treatment Plans</h3>
                <div className="space-y-4">
                    {treatmentPlans.map((plan) => (
                        <div key={plan._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">
                                    Plan Started: {formatDate(plan.start_date)}
                                </h4>
                                {plan.end_date && (
                                    <span className="text-sm text-gray-500">
                                        Completed: {formatDate(plan.end_date)}
                                    </span>
                                )}
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Procedure</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Est. Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plan.procedures.map((procedure, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{procedure.description}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getStatusColor(procedure.status)}
                                                    variant="secondary"
                                                >
                                                    {procedure.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getPriorityColor(procedure.priority)}
                                                    variant="secondary"
                                                >
                                                    {procedure.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${procedure.estimated_cost.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 