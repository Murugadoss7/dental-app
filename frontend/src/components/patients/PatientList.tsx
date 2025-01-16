import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import { useToast } from "@/hooks/use-toast"
import { PatientForm } from "./PatientForm"
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { patientService } from '@/services/api';
import type { Patient } from '@/types/patient';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function PatientList() {
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const debouncedSearch = useDebounce(search, 500)
    const { toast } = useToast()
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: patients = [], isLoading, error } = useQuery({
        queryKey: ["patients", debouncedSearch],
        queryFn: () => patientService.getAll()
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => patientService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: "Success",
                description: "Patient deleted successfully"
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to delete patient",
                variant: "destructive"
            });
        }
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading patients: {error instanceof Error ? error.message : "Unknown error"}
            </div>
        );
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search patients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={() => setIsAddOpen(true)}>Add Patient</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient._id}>
                            <TableCell>
                                {patient.first_name} {patient.last_name}
                            </TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>{patient.contact_number}</TableCell>
                            <TableCell>
                                {format(new Date(patient.date_of_birth), 'PP')}
                            </TableCell>
                            <TableCell className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/patients/${patient._id}/treatment`)}
                                >
                                    Treatment
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(patient._id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <PatientForm
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                patient={null}
            />
            {selectedPatient && (
                <PatientForm
                    open={!!selectedPatient}
                    onOpenChange={() => setSelectedPatient(null)}
                    patient={selectedPatient}
                />
            )}
        </div>
    );
} 