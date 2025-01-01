import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import { useToast } from "@/hooks/use-toast"
import { PatientForm } from "./PatientForm"

interface Address {
    street: string
    city: string
    state: string
    postal_code: string
}

interface MedicalHistory {
    condition: string
    diagnosed_date: string
    notes: string
}

interface Patient {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    contactNumber: string
    email: string
    address: Address
    medicalHistory: MedicalHistory[]
    createdAt: string
    updatedAt: string
}

interface BackendPatient {
    _id: string
    first_name: string
    last_name: string
    date_of_birth: string
    contact_number: string
    email: string
    address: {
        street: string
        city: string
        state: string
        postal_code: string
    }
    medical_history: {
        condition: string
        diagnosed_date: string
        notes: string
    }[]
    created_at: string
    updated_at: string
}

interface BackendResponse {
    patients: BackendPatient[]
    page: number
    per_page: number
    total: number
}

function formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0]
}

function formatDateForDisplay(dateString: string): string {
    return new Date(dateString).toLocaleDateString()
}

function mapBackendPatient(patient: BackendPatient): Patient {
    return {
        id: patient._id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: formatDateForInput(patient.date_of_birth),
        contactNumber: patient.contact_number,
        email: patient.email,
        address: {
            street: patient.address.street,
            city: patient.address.city,
            state: patient.address.state,
            postal_code: patient.address.postal_code,
        },
        medicalHistory: patient.medical_history.map(history => ({
            condition: history.condition,
            diagnosed_date: formatDateForInput(history.diagnosed_date),
            notes: history.notes,
        })),
        createdAt: patient.created_at,
        updatedAt: patient.updated_at,
    }
}

export function PatientList() {
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const debouncedSearch = useDebounce(search, 500)
    const { toast } = useToast()

    const { data, isLoading, error } = useQuery<BackendPatient[]>({
        queryKey: ["patients", debouncedSearch],
        queryFn: async () => {
            const response = await fetch(
                `/api/patients${debouncedSearch ? `?search=${debouncedSearch}` : ""}`,
                {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                }
            )
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || "Failed to fetch patients")
            }
            return response.json()
        },
    })

    const patients = (data || []).map(mapBackendPatient)

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/patients/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete patient")
            }

            toast({
                title: "Success",
                description: "Patient deleted successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete patient",
                variant: "destructive",
            })
        }
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading patients: {error instanceof Error ? error.message : "Unknown error"}
            </div>
        )
    }

    if (isLoading) {
        return <div>Loading...</div>
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

            <div className="rounded-md border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50 text-sm">
                            <th className="p-2 text-left font-medium">Name</th>
                            <th className="p-2 text-left font-medium">Date of Birth</th>
                            <th className="p-2 text-left font-medium">Contact</th>
                            <th className="p-2 text-left font-medium">Email</th>
                            <th className="p-2 text-left font-medium">Address</th>
                            <th className="p-2 text-left font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients?.map((patient) => (
                            <tr key={patient.id} className="border-b">
                                <td className="p-2">
                                    {patient.firstName} {patient.lastName}
                                </td>
                                <td className="p-2">{formatDateForDisplay(patient.dateOfBirth)}</td>
                                <td className="p-2">{patient.contactNumber}</td>
                                <td className="p-2">{patient.email}</td>
                                <td className="p-2">{patient.address.street}, {patient.address.city}, {patient.address.state}, {patient.address.postal_code}</td>
                                <td className="p-2">
                                    <div className="flex gap-2">
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
                                            onClick={() => handleDelete(patient.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
    )
} 