import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkingHours {
    day: string;
    start_time: string;
    end_time: string;
    is_working: boolean;
}

interface BreakHours {
    day: string;
    start_time: string;
    end_time: string;
}

interface Doctor {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    specialization: string;
    working_hours: WorkingHours[];
    break_hours: BreakHours[];
    created_at: string;
    updated_at: string;
}

const workingHoursSchema = z.object({
    day: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    is_working: z.boolean().default(true),
});

const breakHoursSchema = z.object({
    day: z.string(),
    start_time: z.string(),
    end_time: z.string(),
});

const doctorSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    contact_number: z.string().min(1, "Contact number is required"),
    specialization: z.string().min(1, "Specialization is required"),
    working_hours: z.array(workingHoursSchema).default([]),
    break_hours: z.array(breakHoursSchema).default([]),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor?: Doctor | null;
    onClose: () => void;
}

const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function DoctorForm({ open, onOpenChange, doctor, onClose }: DoctorFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const defaultWorkingHours = useMemo(() =>
        DAYS_OF_WEEK.map((day) => ({
            day,
            start_time: "09:00",
            end_time: "17:00",
            is_working: day !== "Saturday" && day !== "Sunday",
        })),
        []
    );

    const form = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            contact_number: "",
            specialization: "",
            working_hours: defaultWorkingHours,
            break_hours: [],
        },
    });

    const handleClose = () => {
        form.reset();
        form.clearErrors();
        onClose();
    };

    // Reset form when doctor changes
    useEffect(() => {
        if (doctor) {
            form.reset({
                first_name: doctor.first_name,
                last_name: doctor.last_name,
                email: doctor.email,
                contact_number: doctor.contact_number,
                specialization: doctor.specialization,
                working_hours: doctor.working_hours,
                break_hours: doctor.break_hours,
            });
        } else {
            form.reset({
                first_name: "",
                last_name: "",
                email: "",
                contact_number: "",
                specialization: "",
                working_hours: defaultWorkingHours,
                break_hours: [],
            });
        }
        form.clearErrors();
    }, [doctor, form, defaultWorkingHours]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset({
                first_name: "",
                last_name: "",
                email: "",
                contact_number: "",
                specialization: "",
                working_hours: defaultWorkingHours,
                break_hours: [],
            });
            form.clearErrors();
        }
    }, [open, form, defaultWorkingHours]);

    const createMutation = useMutation({
        mutationFn: async (data: DoctorFormValues) => {
            const response = await fetch("http://localhost:8000/api/doctors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to create doctor");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctors"] });
            toast({
                title: "Success",
                description: "Doctor created successfully",
            });
            onClose();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create doctor",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: DoctorFormValues) => {
            const response = await fetch(`http://localhost:8000/api/doctors/${doctor?._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to update doctor");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctors"] });
            toast({
                title: "Success",
                description: "Doctor updated successfully",
            });
            onClose();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update doctor",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: DoctorFormValues) => {
        if (doctor) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) handleClose();
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-3xl h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{doctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[calc(90vh-8rem)]">
                        <ScrollArea className="flex-1 px-6">
                            <div className="space-y-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contact_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="specialization"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specialization</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Working Hours</h3>
                                    {DAYS_OF_WEEK.map((day, index) => (
                                        <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <FormField
                                                control={form.control}
                                                name={`working_hours.${index}.is_working`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="!mt-0">{day}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`working_hours.${index}.start_time`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Start Time</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`working_hours.${index}.end_time`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>End Time</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <input
                                                type="hidden"
                                                {...form.register(`working_hours.${index}.day`)}
                                                value={day}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="border-t bg-white p-4 mt-auto">
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {doctor ? "Update" : "Create"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 