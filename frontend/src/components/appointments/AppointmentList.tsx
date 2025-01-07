import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AppointmentForm } from "./AppointmentForm";

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
    created_at: string;
    updated_at: string;
}

export function AppointmentList() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: appointments, isLoading } = useQuery<Appointment[]>({
        queryKey: ["appointments"],
        queryFn: async () => {
            const response = await fetch("http://localhost:8000/api/appointments");
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to fetch appointments");
            }
            return response.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (appointmentId: string) => {
            const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to delete appointment");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast({
                title: "Success",
                description: "Appointment deleted successfully",
            });
            setAppointmentToDelete(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete appointment",
                variant: "destructive",
            });
        },
    });

    const handleDelete = (appointment: Appointment) => {
        setAppointmentToDelete(appointment);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (appointmentToDelete) {
            deleteMutation.mutate(appointmentToDelete._id);
        }
        setIsDeleteDialogOpen(false);
    };

    const getStatusBadgeVariant = (status: Appointment['status']) => {
        switch (status) {
            case 'scheduled':
                return 'secondary';
            case 'completed':
                return 'default';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const handleEdit = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsFormOpen(true);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!appointments || appointments.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Appointments</h2>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Appointment
                    </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                    No appointments found. Schedule your first appointment using the button above.
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Appointments</h2>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Appointment
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments.map((appointment) => (
                            <TableRow key={appointment._id}>
                                <TableCell>
                                    {appointment.patient.first_name} {appointment.patient.last_name}
                                </TableCell>
                                <TableCell>
                                    {appointment.doctor.first_name} {appointment.doctor.last_name}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(appointment.start_time), "PPp")}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>{appointment.reason}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(appointment)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(appointment)}
                                        >
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AppointmentForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedAppointment(null);
                    }
                    setIsFormOpen(open);
                }}
                appointment={selectedAppointment}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the appointment for{" "}
                            {appointmentToDelete ? `${appointmentToDelete.patient.first_name} ${appointmentToDelete.patient.last_name}` : ""}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 