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
import { patientService } from '@/services/api'
import type { Patient } from '@/types/patient'

const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
})

const medicalHistorySchema = z.object({
    allergies: z.array(z.string()).default([]),
    conditions: z.array(z.string()).default([]),
    medications: z.array(z.string()).default([])
})

const patientSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    contact_number: z.string().min(1, "Contact number is required"),
    email: z.string().email("Invalid email address"),
    address: addressSchema,
    medical_history: medicalHistorySchema.optional().default({
        allergies: [],
        conditions: [],
        medications: []
    }),
})

type PatientFormValues = z.infer<typeof patientSchema>

interface PatientFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient: Patient | null
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
            date_of_birth: formatDateForInput(patient.date_of_birth),
            medical_history: patient.medical_history || {
                allergies: [],
                conditions: [],
                medications: []
            }
        } : {
            first_name: "",
            last_name: "",
            date_of_birth: "",
            contact_number: "",
            email: "",
            address: {
                street: "",
                city: "",
                state: "",
                postal_code: "",
            },
            medical_history: {
                allergies: [],
                conditions: [],
                medications: []
            }
        },
    })

    const mutation = useMutation({
        mutationFn: (values: PatientFormValues) => {
            const patientData = {
                ...values,
                date_of_birth: new Date(values.date_of_birth).toISOString(),
                medical_history: {
                    allergies: values.medical_history?.allergies || [],
                    conditions: values.medical_history?.conditions || [],
                    medications: values.medical_history?.medications || []
                }
            }

            return patient
                ? patientService.update(patient._id, patientData)
                : patientService.create(patientData)
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
                                        name="date_of_birth"
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

                            <div className="flex justify-end">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Save Patient"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
} 