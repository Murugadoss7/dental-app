import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Predefined medicine groups
const MEDICINE_GROUPS = {
    kmos: {
        grpKey: 'kmos',
        presList: [
            { name: 'Mefenamic Acid', dosage: '500mg', frequency: '3x', duration: '3 days', instructions: 'Take after meals' },
            { name: 'Amoxicillin', dosage: '500mg', frequency: '3x', duration: '5 days', instructions: 'Take after meals' },
            { name: 'Omeprazole', dosage: '40mg', frequency: '1x', duration: '5 days', instructions: 'Take before breakfast' }
        ]
    },
    ad3doc: {
        grpKey: 'ad3doc',
        presList: [
            { name: 'Celecoxib', dosage: '200mg', frequency: '2x', duration: '3 days', instructions: 'Take after meals' },
            { name: 'Clindamycin', dosage: '300mg', frequency: '4x', duration: '5 days', instructions: 'Take after meals' },
            { name: 'Omeprazole', dosage: '40mg', frequency: '1x', duration: '5 days', instructions: 'Take before breakfast' }
        ]
    },
    amoc: {
        grpKey: 'amoc',
        presList: [
            { name: 'Amoxicillin', dosage: '500mg', frequency: '3x', duration: '5 days', instructions: 'Take after meals' },
            { name: 'Mefenamic Acid', dosage: '500mg', frequency: '3x', duration: '3 days', instructions: 'Take after meals' }
        ]
    }
};

const medicationSchema = z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().min(1, 'Instructions are required'),
});

const prescriptionFormSchema = z.object({
    medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
});

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

interface PrescriptionFormProps {
    onSubmit: (data: PrescriptionFormData) => void;
}

export function PrescriptionForm({ onSubmit }: PrescriptionFormProps) {
    const { toast } = useToast();
    const form = useForm<PrescriptionFormData>({
        resolver: zodResolver(prescriptionFormSchema),
        defaultValues: {
            medications: [
                {
                    name: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    instructions: '',
                },
            ],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: 'medications',
    });

    // Handle shortcut keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if Alt key is pressed
            if (!e.altKey) return;

            const key = e.key.toLowerCase();
            const group = Object.values(MEDICINE_GROUPS).find(g => g.grpKey === key);

            if (group) {
                e.preventDefault();
                replace(group.presList);
                toast({
                    title: "Prescription Template Applied",
                    description: `Applied ${group.grpKey.toUpperCase()} template`,
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [replace, toast]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <h4 className="text-sm font-medium mb-2">Shortcut Keys (Alt + Key):</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p><kbd className="px-1 rounded bg-muted">K</kbd> - KMOS (Pain/Infection)</p>
                        <p><kbd className="px-1 rounded bg-muted">A</kbd> - AD3DOC (Advanced)</p>
                        <p><kbd className="px-1 rounded bg-muted">M</kbd> - AMOC (Standard)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Medication {index + 1}</h4>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name={`medications.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Medication Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter medication name" {...field} className="h-8" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`medications.${index}.dosage`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Dosage</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter dosage" {...field} className="h-8" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`medications.${index}.frequency`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Frequency</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter frequency" {...field} className="h-8" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`medications.${index}.duration`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Duration</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter duration" {...field} className="h-8" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`medications.${index}.instructions`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Instructions</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter instructions" {...field} className="h-8" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => append({
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        instructions: '',
                    })}
                >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Medication
                </Button>

                <Button type="submit" className="w-full">
                    Save Prescription
                </Button>
            </form>
        </Form>
    );
} 