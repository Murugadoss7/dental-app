import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isSameHour, isAfter, isBefore, addHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Appointment {
    _id: string;
    patient: {
        _id: string;
        first_name: string;
        last_name: string;
    };
    doctor: {
        _id: string;
        first_name: string;
        last_name: string;
    };
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    reason: string;
}

// Request structure for updating appointments
interface AppointmentRequest {
    patient_id: string;
    doctor_id: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    reason: string;
}

function getStatusColor(status: Appointment['status']) {
    switch (status) {
        case 'scheduled':
            return 'bg-blue-100 text-blue-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function TimeSlot({ time, appointments, isLoading, onStatusUpdate }: {
    time: Date;
    appointments: Appointment[];
    isLoading: boolean;
    onStatusUpdate: (appointmentId: string, newStatus: Appointment['status']) => void;
}) {
    const navigate = useNavigate();
    const hourAppointments = appointments.filter(apt =>
        isSameHour(new Date(apt.start_time), time)
    );

    const isCurrentHour = isSameHour(new Date(), time);
    const isPastHour = isBefore(time, new Date());

    const handleAppointmentClick = (appointment: Appointment) => {
        navigate(`/patients/${appointment.patient._id}/treatment`);
    };

    return (
        <div className={cn(
            "flex items-start p-4 border-b",
            isCurrentHour && "bg-blue-50",
            isPastHour && "bg-gray-50"
        )}>
            <div className="w-20 flex-shrink-0">
                <span className="text-sm font-medium">
                    {format(time, 'HH:mm')}
                </span>
            </div>
            <div className="flex-1 space-y-2">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : hourAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500">No appointments</p>
                ) : (
                    hourAppointments.map((apt) => (
                        <div
                            key={apt._id}
                            className={cn(
                                "p-3 rounded-lg transition-all",
                                getStatusColor(apt.status),
                                "hover:shadow-md hover:scale-[1.02] active:scale-[0.99]",
                                "group relative"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 cursor-pointer" onClick={() => handleAppointmentClick(apt)}>
                                    <p className="font-medium">
                                        {apt.patient.first_name} {apt.patient.last_name}
                                    </p>
                                    <p className="text-sm">
                                        {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        {apt.status}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => onStatusUpdate(apt._id, 'scheduled')}
                                                disabled={apt.status === 'scheduled'}
                                            >
                                                Mark as Scheduled
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onStatusUpdate(apt._id, 'completed')}
                                                disabled={apt.status === 'completed'}
                                            >
                                                Mark as Completed
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onStatusUpdate(apt._id, 'cancelled')}
                                                disabled={apt.status === 'cancelled'}
                                                className="text-red-600"
                                            >
                                                Cancel Appointment
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <p className="text-sm mt-1">{apt.reason}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function Dashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch today's appointments
    const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
        queryKey: ["appointments", "today"],
        queryFn: async () => {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

            const response = await fetch(
                `http://localhost:8000/api/appointments?start_time=${startOfDay}&end_time=${endOfDay}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch appointments");
            }
            return response.json();
        },
    });

    // Update appointment status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: Appointment['status'] }) => {
            // Get the current appointment data first
            const currentAppointment = appointments.find(apt => apt._id === appointmentId);
            if (!currentAppointment) {
                throw new Error('Appointment not found');
            }

            // Prepare the update data with all required fields
            const updateData: Partial<AppointmentRequest> = {
                patient_id: currentAppointment.patient._id,
                doctor_id: currentAppointment.doctor._id,
                start_time: currentAppointment.start_time,
                end_time: currentAppointment.end_time,
                status: status,
                reason: currentAppointment.reason,
            };

            console.log('🚀 Updating appointment with data:', JSON.stringify(updateData, null, 2));

            const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update appointment status');
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast({
                title: "Status Updated",
                description: "Appointment status has been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update appointment status. Please try again.",
                variant: "destructive",
            });
        },
    });

    const handleStatusUpdate = (appointmentId: string, newStatus: Appointment['status']) => {
        updateStatusMutation.mutate({ appointmentId, status: newStatus });
    };

    // Calculate statistics
    const todayStats = {
        total: appointments?.length || 0,
        upcoming: appointments?.filter(apt =>
            new Date(apt.start_time) > new Date() && apt.status === 'scheduled'
        ).length || 0,
        completed: appointments?.filter(apt => apt.status === 'completed').length || 0
    };

    // Generate time slots for the day (8 AM to 8 PM)
    const timeSlots = Array.from({ length: 13 }, (_, i) => {
        const date = new Date();
        date.setHours(8 + i, 0, 0, 0);
        return date;
    });

    return (
        <div className="space-y-6">
            {/* Today's Overview Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            appointments scheduled for today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStats.upcoming}</div>
                        <p className="text-xs text-muted-foreground">
                            appointments remaining today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStats.completed}</div>
                        <p className="text-xs text-muted-foreground">
                            appointments completed today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Statistics Cards - Placeholder */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Weekly Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Coming Soon</div>
                    </CardContent>
                </Card>
                {/* Add more statistics cards as placeholders */}
            </div>

            {/* Appointment Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-1">
                            {timeSlots.map((time) => (
                                <TimeSlot
                                    key={time.toISOString()}
                                    time={time}
                                    appointments={appointments}
                                    isLoading={isLoading}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Patient Insights - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Patient Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Patient insights coming soon</p>
                </CardContent>
            </Card>

            {/* Analytics Section - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Analytics coming soon</p>
                </CardContent>
            </Card>

            {/* Quick Actions - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Quick actions coming soon</p>
                </CardContent>
            </Card>

            {/* Notifications Panel - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Notifications coming soon</p>
                </CardContent>
            </Card>
        </div>
    );
} 