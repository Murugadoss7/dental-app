import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
})

const medicalHistorySchema = z.object({
    condition: z.string().min(1, "Condition is required"),
    diagnosed_date: z.string().min(1, "Diagnosed date is required"),
    notes: z.string().optional().default(""),
})

const patientSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    email: z.string().email("Invalid email address"),
    address: addressSchema,
    medicalHistory: z.array(medicalHistorySchema).optional().default([]),
})

type PatientFormValues = z.infer<typeof patientSchema>

interface PatientFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient: {
        id: string
        firstName: string
        lastName: string
        dateOfBirth: string
        contactNumber: string
        email: string
        address: {
            street: string
            city: string
            state: string
            postal_code: string
        }
        medicalHistory: Array<{
            condition: string
            diagnosed_date: string
            notes: string
        }>
    } | null
}

function formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0]
}

export function PatientForm({ open, onOpenChange, patient }: PatientFormProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: patient ? {
            ...patient,
            dateOfBirth: formatDateForInput(patient.dateOfBirth),
            medicalHistory: patient.medicalHistory.map(history => ({
                ...history,
                diagnosed_date: formatDateForInput(history.diagnosed_date),
            })),
        } : {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            contactNumber: "",
            email: "",
            address: {
                street: "",
                city: "",
                state: "",
                postal_code: "",
            },
            medicalHistory: [],
        },
    })

    const mutation = useMutation({
        mutationFn: async (values: PatientFormValues) => {
            const backendValues = {
                first_name: values.firstName,
                last_name: values.lastName,
                date_of_birth: new Date(values.dateOfBirth).toISOString(),
                contact_number: values.contactNumber,
                email: values.email,
                address: {
                    street: values.address.street,
                    city: values.address.city,
                    state: values.address.state,
                    postal_code: values.address.postal_code,
                },
                medical_history: values.medicalHistory?.length
                    ? values.medicalHistory.map(history => ({
                        condition: history.condition,
                        diagnosed_date: new Date(history.diagnosed_date).toISOString(),
                        notes: history.notes || "",
                    }))
                    : []
            }

            const response = await fetch(
                patient ? `/api/patients/${patient.id}` : "/api/patients",
                {
                    method: patient ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(backendValues),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || "Failed to save patient")
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patients"] })
            onOpenChange(false)
            form.reset()
            toast({
                title: "Success",
                description: `Patient ${patient ? "updated" : "added"} successfully`,
            })
        },
        onError: () => {
            toast({
                title: "Error",
                description: `Failed to ${patient ? "update" : "add"} patient`,
                variant: "destructive",
            })
        },
    })

    function onSubmit(values: PatientFormValues) {
        mutation.mutate(values)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 py-4 bg-white border-b">
                    <DialogTitle>{patient ? "Edit" : "Add"} Patient</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 px-6 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="font-medium">Personal Information</h3>
                                    <FormField
                                        control={form.control}
                                        name="firstName"
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
                                        name="lastName"
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
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contactNumber"
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
                                </div>

                                {/* Address Information */}
                                <div className="space-y-4">
                                    <h3 className="font-medium">Address</h3>
                                    <FormField
                                        control={form.control}
                                        name="address.street"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address.postal_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Medical History Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Medical History</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const currentHistory = form.getValues("medicalHistory")
                                            form.setValue("medicalHistory", [
                                                ...currentHistory,
                                                { condition: "", diagnosed_date: "", notes: "" },
                                            ])
                                        }}
                                    >
                                        Add Medical History
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {form.watch("medicalHistory")?.map((_, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                            <FormField
                                                control={form.control}
                                                name={`medicalHistory.${index}.condition`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Condition</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`medicalHistory.${index}.diagnosed_date`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Diagnosed Date</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`medicalHistory.${index}.notes`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Notes</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const currentHistory = form.getValues("medicalHistory")
                                                        form.setValue(
                                                            "medicalHistory",
                                                            currentHistory.filter((_, i) => i !== index)
                                                        )
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
                <div className="px-6 py-4 bg-white border-t flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 