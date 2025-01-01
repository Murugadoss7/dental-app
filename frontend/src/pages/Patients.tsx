import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatientList } from '../components/patients/PatientList';
import { PatientForm } from '../components/patients/PatientForm';
import { toast } from '../components/ui/use-toast';

interface Patient {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    date_of_birth: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
    };
}

export default function Patients() {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
    const queryClient = useQueryClient();

    // Create patient mutation
    const createMutation = useMutation({
        mutationFn: async (data: Omit<Patient, '_id'>) => {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create patient');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: 'Success',
                description: 'Patient created successfully',
            });
            setIsFormOpen(false);
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Update patient mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => {
            const response = await fetch(`/api/patients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update patient');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: 'Success',
                description: 'Patient updated successfully',
            });
            setIsFormOpen(false);
            setEditingPatient(null);
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Delete patient mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/patients/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete patient');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: 'Success',
                description: 'Patient deleted successfully',
            });
        },
        onError: (error) => {
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