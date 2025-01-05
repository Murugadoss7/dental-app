import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const diagnosisFormSchema = z.object({
    chief_complaint: z.string().min(1, 'Chief complaint is required'),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    clinical_findings: z.string().min(1, 'Clinical findings are required'),
    treatment_notes: z.string().min(1, 'Treatment notes are required'),
    teeth_involved: z.string().transform((val) => val.split(',').map((t) => t.trim())),
});

type DiagnosisFormData = z.infer<typeof diagnosisFormSchema>;

interface DiagnosisFormProps {
    onSubmit: (data: DiagnosisFormData) => void;
}

export function DiagnosisForm({ onSubmit }: DiagnosisFormProps) {
    const form = useForm<DiagnosisFormData>({
        resolver: zodResolver(diagnosisFormSchema),
        defaultValues: {
            chief_complaint: '',
            diagnosis: '',
            clinical_findings: '',
            treatment_notes: '',
            teeth_involved: '',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="chief_complaint"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chief Complaint</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter patient's main complaint"
                                    {...field}
                                />
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
                            <FormLabel>Diagnosis</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter diagnosis"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="clinical_findings"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Clinical Findings</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter clinical findings"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="treatment_notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Treatment Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter treatment notes"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="teeth_involved"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teeth Involved</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter teeth numbers (comma-separated)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Save Diagnosis
                </Button>
            </form>
        </Form>
    );
} 