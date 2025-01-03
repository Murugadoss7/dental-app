import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkingHours {
    start_time: string;
    end_time: string;
}

interface AppointmentSettings {
    _id?: string;
    slot_duration: number;
    buffer_time: number;
    advance_booking_days: number;
    working_days: string[];
    working_hours: WorkingHours;
    created_at?: string;
    updated_at?: string;
}

const workingHoursSchema = z.object({
    start_time: z.string(),
    end_time: z.string()
});

const settingsSchema = z.object({
    slot_duration: z.number().min(10, "Slot duration must be at least 10 minutes"),
    buffer_time: z.number().min(0, "Buffer time cannot be negative"),
    advance_booking_days: z.number().min(1, "Must allow at least 1 day advance booking"),
    working_days: z.array(z.string()),
    working_hours: workingHoursSchema
});

const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

export function AppointmentSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<AppointmentSettings>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            slot_duration: 30,
            buffer_time: 10,
            advance_booking_days: 30,
            working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            working_hours: {
                start_time: "09:00",
                end_time: "17:00"
            }
        },
    });

    const { data: settings, isLoading } = useQuery<AppointmentSettings>({
        queryKey: ["appointment-settings"],
        queryFn: async () => {
            const response = await fetch("http://localhost:8000/api/appointment-settings");
            if (!response.ok) {
                throw new Error("Failed to fetch settings");
            }
            return response.json();
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: AppointmentSettings) => {
            const response = await fetch("http://localhost:8000/api/appointment-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Failed to save settings");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointment-settings"] });
            toast({
                title: "Success",
                description: "Settings saved successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (settings) {
            form.reset(settings);
        }
    }, [settings, form]);

    function onSubmit(data: AppointmentSettings) {
        mutation.mutate(data);
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Configure general appointment settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="slot_duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slot Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="buffer_time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Buffer Time (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="advance_booking_days"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Advance Booking Days</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Working Days</CardTitle>
                            <CardDescription>
                                Select working days
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {DAYS_OF_WEEK.map((day) => (
                                    <FormField
                                        key={day}
                                        control={form.control}
                                        name="working_days"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value.includes(day)}
                                                        onCheckedChange={(checked) => {
                                                            const updatedDays = checked
                                                                ? [...field.value, day]
                                                                : field.value.filter((d) => d !== day);
                                                            field.onChange(updatedDays);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">{day}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Working Hours</CardTitle>
                            <CardDescription>
                                Set working hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="working_hours.start_time"
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
                                    name="working_hours.end_time"
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
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit">
                            Save Settings
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 