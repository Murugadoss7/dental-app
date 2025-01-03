import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { DoctorForm } from "./DoctorForm";

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

export function DoctorList() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: doctors, isLoading } = useQuery<Doctor[]>({
        queryKey: ["doctors"],
        queryFn: async () => {
            const response = await fetch("http://localhost:8000/api/doctors");
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to fetch doctors");
            }
            const data = await response.json();
            console.log('Fetched doctors:', data);
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (doctorId: string) => {
            const response = await fetch(`http://localhost:8000/api/doctors/${doctorId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to delete doctor");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctors"] });
            toast({
                title: "Success",
                description: "Doctor deleted successfully",
            });
            setDoctorToDelete(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete doctor",
                variant: "destructive",
            });
        },
    });

    const handleEdit = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsFormOpen(true);
    };

    const handleDelete = (doctor: Doctor) => {
        setDoctorToDelete(doctor);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (doctorToDelete) {
            deleteMutation.mutate(doctorToDelete._id);
        }
        setIsDeleteDialogOpen(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!doctors || doctors.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Doctors</h2>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Doctor
                    </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                    No doctors found. Add your first doctor using the button above.
                </div>
                <DoctorForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    doctor={selectedDoctor}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedDoctor(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Doctors</h2>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Specialization</TableHead>
                            <TableHead>Working Days</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {doctors.map((doctor) => (
                            <TableRow key={doctor._id}>
                                <TableCell>
                                    {doctor.first_name} {doctor.last_name}
                                </TableCell>
                                <TableCell>{doctor.email}</TableCell>
                                <TableCell>{doctor.contact_number}</TableCell>
                                <TableCell>{doctor.specialization}</TableCell>
                                <TableCell>
                                    {doctor.working_hours
                                        ?.filter(wh => wh.is_working)
                                        .map(wh => wh.day)
                                        .join(", ") || "Not set"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(doctor)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(doctor)}
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

            <DoctorForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                doctor={selectedDoctor}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedDoctor(null);
                }}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the doctor{" "}
                            {doctorToDelete ? `${doctorToDelete.first_name} ${doctorToDelete.last_name}` : ""}.
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