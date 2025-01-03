import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

// Types
interface Patient {
    _id: string;
    first_name: string;
    last_name: string;
}

interface Doctor {
    _id: string;
    first_name: string;
    last_name: string;
}

interface Appointment {
    _id: string;
    patient: Patient;
    doctor: Doctor;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    reason: string;
    notes?: string;
}

// Form schema
const appointmentSchema = z.object({
    patient_id: z.string().min(1, "Patient is required"),
    doctor_id: z.string().min(1, "Doctor is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    status: z.enum(['scheduled', 'completed', 'cancelled']),
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment?: Appointment | null;
}

export function AppointmentForm({ open, onOpenChange, appointment }: AppointmentFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch doctors list
    const { data: doctors, isLoading: isDoctorsLoading } = useQuery<Doctor[]>({
        queryKey: ["doctors"],
        queryFn: async () => {
            const response = await fetch("http://localhost:8000/api/doctors");
            if (!response.ok) throw new Error("Failed to fetch doctors");
            return response.json();
        }
    });

    // Fetch patients list
    const { data: patients, isLoading: isPatientsLoading } = useQuery<Patient[]>({
        queryKey: ["patients"],
        queryFn: async () => {
            const response = await fetch("http://localhost:8000/api/patients");
            if (!response.ok) throw new Error("Failed to fetch patients");
            return response.json();
        }
    });

    // Initialize form with empty values
    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patient_id: "",
            doctor_id: "",
            start_time: "",
            end_time: "",
            status: "scheduled",
            reason: "",
            notes: "",
        }
    });

    useEffect(() => {
        if (appointment) {
            console.log('Setting form values:', {
                patient_id: appointment.patient._id,
                doctor_id: appointment.doctor._id,
                start_time: appointment.start_time.slice(0, 16),
                end_time: appointment.end_time.slice(0, 16),
                status: appointment.status,
                reason: appointment.reason,
                notes: appointment.notes || "",
            });
            form.reset({
                patient_id: appointment.patient._id,
                doctor_id: appointment.doctor._id,
                start_time: appointment.start_time.slice(0, 16),
                end_time: appointment.end_time.slice(0, 16),
                status: appointment.status,
                reason: appointment.reason,
                notes: appointment.notes || "",
            });
        }
    }, [appointment, form]);

    // Handle form submission
    const mutation = useMutation({
        mutationFn: async (values: AppointmentFormValues) => {
            console.log('Mutation called with:', values);
            const response = await fetch(
                appointment
                    ? `http://localhost:8000/api/appointments/${appointment._id}`
                    : "http://localhost:8000/api/appointments",
                {
                    method: appointment ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `Failed to ${appointment ? 'update' : 'create'} appointment`);
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast({
                title: "Success",
                description: `Appointment ${appointment ? 'updated' : 'created'} successfully`
            });
            onOpenChange(false);
        },
        onError: (error: Error) => {
            console.error('Mutation error:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (isDoctorsLoading || isPatientsLoading) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    form.reset();
                    onOpenChange(false);
                }
            }}
        >
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{appointment ? "Edit" : "New"} Appointment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((data) => {
                            console.log('Form submitted with data:', data);
                            const submitData = {
                                ...data,
                                patient_id: appointment?.patient._id || data.patient_id,
                            };
                            console.log('Submitting data:', submitData);
                            mutation.mutate(submitData);
                        })}
                        className="space-y-4 py-4"
                    >
                        {/* Patient Info */}
                        {appointment ? (
                            // Read-only patient info for edit mode
                            <FormItem>
                                <FormLabel>Patient</FormLabel>
                                <FormControl>
                                    <Input
                                        value={`${appointment.patient.first_name} ${appointment.patient.last_name}`}
                                        disabled
                                    />
                                </FormControl>
                            </FormItem>
                        ) : (
                            // Patient selection for create mode
                            <FormField
                                control={form.control}
                                name="patient_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a patient" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {patients?.map((patient) => (
                                                    <SelectItem key={patient._id} value={patient._id}>
                                                        {patient.first_name} {patient.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Doctor Selection */}
                        <FormField
                            control={form.control}
                            name="doctor_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Doctor</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            console.log('Doctor selected:', value);
                                            field.onChange(value);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {doctors?.find(d => d._id === field.value)
                                                        ? `${doctors.find(d => d._id === field.value)?.first_name} ${doctors.find(d => d._id === field.value)?.last_name}`
                                                        : "Select a doctor"
                                                    }
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {doctors?.map((doctor) => (
                                                <SelectItem key={doctor._id} value={doctor._id}>
                                                    {doctor.first_name} {doctor.last_name}
                                                    {doctor._id === appointment?.doctor._id ? ' (Current)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date/Time Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Reason */}
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    onOpenChange(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 