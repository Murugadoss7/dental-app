import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ClinicalFindingsGroup } from "./ClinicalFindingsGroup";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface ClinicalFinding {
    id: string;
    teeth: {
        group: 'upper' | 'lower';
        numbers: string[];
    };
    issue: {
        id?: string;
        name: string;
        is_custom: boolean;
    };
    finding: string;
    recommended_treatment: {
        id?: string;
        name: string;
        is_custom: boolean;
    };
}

const diagnosisFormSchema = z.object({
    chief_complaint: z.string().min(1, "Chief complaint is required"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
});

type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;

interface DiagnosisFormProps {
    onSubmit: (data: DiagnosisFormValues & { clinical_findings: ClinicalFinding[] }) => void;
}

export function DiagnosisForm({ onSubmit }: DiagnosisFormProps) {
    const { toast } = useToast();
    const [clinicalFindings, setClinicalFindings] = useState<ClinicalFinding[]>([]);

    const form = useForm<DiagnosisFormValues>({
        resolver: zodResolver(diagnosisFormSchema),
        defaultValues: {
            chief_complaint: "",
            diagnosis: "",
        },
    });

    const handleSubmit = (values: DiagnosisFormValues) => {
        if (!clinicalFindings.length) {
            toast({
                title: "Error",
                description: "Please add at least one clinical finding",
                variant: "destructive",
            });
            return;
        }

        onSubmit({
            ...values,
            clinical_findings: clinicalFindings,
        });
    };

    const addFindingGroup = () => {
        const newFinding: ClinicalFinding = {
            id: crypto.randomUUID(),
            teeth: {
                group: 'upper',
                numbers: []
            },
            issue: {
                name: '',
                is_custom: false
            },
            finding: '',
            recommended_treatment: {
                name: '',
                is_custom: false
            }
        };
        setClinicalFindings([...clinicalFindings, newFinding]);
    };

    const updateFindingGroup = (index: number, finding: ClinicalFinding) => {
        const updatedFindings = [...clinicalFindings];
        updatedFindings[index] = finding;
        setClinicalFindings(updatedFindings);
    };

    const removeFindingGroup = (index: number) => {
        const updatedFindings = clinicalFindings.filter((_, i) => i !== index);
        setClinicalFindings(updatedFindings);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Chief Complaint and Diagnosis Section */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="chief_complaint"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">Chief Complaint</FormLabel>
                                <FormControl>
                                    <Textarea {...field} className="h-24 resize-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">Diagnosis</FormLabel>
                                <FormControl>
                                    <Textarea {...field} className="h-24 resize-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Clinical Findings Section */}
                <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-base font-medium">Clinical Findings</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFindingGroup}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Finding
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {clinicalFindings.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg">
                                Click "Add Finding" to start adding clinical findings
                            </div>
                        ) : (
                            clinicalFindings.map((finding, index) => (
                                <ClinicalFindingsGroup
                                    key={finding.id}
                                    finding={finding}
                                    onUpdate={(updatedFinding) => updateFindingGroup(index, updatedFinding)}
                                    onRemove={() => removeFindingGroup(index)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    Save Treatment Record
                </Button>
            </form>
        </Form>
    );
} 