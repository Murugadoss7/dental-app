import { useFieldArray, useForm } from 'react-hook-form';
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
import { Plus, Trash2 } from 'lucide-react';

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

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'medications',
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">Medication {index + 1}</h4>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name={`medications.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medication Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter medication name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`medications.${index}.dosage`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dosage</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter dosage" {...field} />
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
                                        <FormLabel>Frequency</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter frequency" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`medications.${index}.duration`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter duration" {...field} />
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
                                        <FormLabel>Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter instructions"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        instructions: '',
                    })}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                </Button>

                <Button type="submit" className="w-full">
                    Save Prescription
                </Button>
            </form>
        </Form>
    );
} 