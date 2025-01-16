import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { PatientList } from '@/components/patients/PatientList';
import { patientService } from '@/services/api';
import type { Patient } from '@/types/patient';

export default function Patients() {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
    const queryClient = useQueryClient();

    // Create patient mutation
    const createMutation = useMutation({
        mutationFn: (data: Omit<Patient, '_id'>) => patientService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: 'Success',
                description: 'Patient created successfully',
            });
            setIsFormOpen(false);
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Update patient mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => patientService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: 'Success',
                description: 'Patient updated successfully',
            });
            setIsFormOpen(false);
            setEditingPatient(null);
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Delete patient mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => patientService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: 'Success',
                description: 'Patient deleted successfully',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleAdd = () => {
        setEditingPatient(null);
        setIsFormOpen(true);
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleSubmit = async (data: Omit<Patient, '_id'>) => {
        if (editingPatient) {
            await updateMutation.mutateAsync({ id: editingPatient._id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <PatientList
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <PatientForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingPatient(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingPatient || undefined}
                title={editingPatient ? 'Edit Patient' : 'Add Patient'}
            />
        </div>
    );
} 