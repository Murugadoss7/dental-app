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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

const procedureSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    estimated_cost: z.string().transform((val) => parseFloat(val)),
    status: z.enum(['planned', 'completed', 'cancelled']),
    priority: z.enum(['high', 'medium', 'low']),
});

const treatmentPlanFormSchema = z.object({
    procedures: z.array(procedureSchema).min(1, 'At least one procedure is required'),
});

type TreatmentPlanFormData = z.infer<typeof treatmentPlanFormSchema>;

interface TreatmentPlanFormProps {
    onSubmit: (data: TreatmentPlanFormData) => void;
}

export function TreatmentPlanForm({ onSubmit }: TreatmentPlanFormProps) {
    const form = useForm<TreatmentPlanFormData>({
        resolver: zodResolver(treatmentPlanFormSchema),
        defaultValues: {
            procedures: [
                {
                    description: '',
                    estimated_cost: '',
                    status: 'planned',
                    priority: 'medium',
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'procedures',
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">Procedure {index + 1}</h4>
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
                                name={`procedures.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter procedure description"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`procedures.${index}.estimated_cost`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Cost</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter estimated cost"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`procedures.${index}.status`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="planned">Planned</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`procedures.${index}.priority`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                        description: '',
                        estimated_cost: '',
                        status: 'planned',
                        priority: 'medium',
                    })}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Procedure
                </Button>

                <Button type="submit" className="w-full">
                    Save Treatment Plan
                </Button>
            </form>
        </Form>
    );
} 